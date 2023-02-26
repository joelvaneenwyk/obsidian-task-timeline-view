import { App, ItemView, Notice, Pos } from 'obsidian';
import * as React from 'react';
import { CreateNewTaskContext, TaskItemEventHandlersContext } from './components/context';
import { TimelineView } from './components/timelineview';
import { ObsidianTaskAdapter } from './taskadapter';
import { TimelineSettings } from './utils/options';
import { TaskDataModel, TaskRegularExpressions } from './utils/tasks';

const defaultObsidianBridgeProps = {
    plugin: {} as ItemView,
}
const defaultObsidianBridgeState = {
    taskList: [] as TaskDataModel[],
}
type ObsidianBridgeProps = Readonly<typeof defaultObsidianBridgeProps>;
type ObsidianBridgeState = typeof defaultObsidianBridgeState;
export class ObsidianBridge extends React.Component<ObsidianBridgeProps, ObsidianBridgeState> {
    private readonly options: TimelineSettings;
    private readonly adapter: ObsidianTaskAdapter;
    private readonly app: App;
    constructor(props: ObsidianBridgeProps) {
        super(props);

        this.options = Object.assign({}, {}, new TimelineSettings());
        this.app = this.props.plugin.app;

        this.handleCreateNewTask = this.handleCreateNewTask.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleOpenFile = this.handleOpenFile.bind(this);
        this.handleCompleteTask = this.handleCompleteTask.bind(this);
        this.onUpdateTasks = this.onUpdateTasks.bind(this);

        this.adapter = new ObsidianTaskAdapter(this.app);

        this.state = {
            taskList: [],
        }
    }

    componentDidMount(): void {
        this.props.plugin.registerEvent(this.app.vault.on("create", this.onUpdateTasks));
        this.props.plugin.registerEvent(this.app.vault.on("delete", this.onUpdateTasks));
        this.props.plugin.registerEvent(this.app.vault.on("modify", this.onUpdateTasks));
        this.props.plugin.registerEvent(this.app.vault.on("rename", this.onUpdateTasks));
        this.onUpdateTasks();
    }

    async onUpdateTasks() {
        this.adapter.generateTasksList().then(() => {
            this.adapter.parseTasks().then(() => {
                const tasks = this.adapter.getTaskList();
                if (this.options.taskFiles.size === 0) {
                    tasks.forEach(t => {
                        this.options.taskFiles.add(t.path);
                    })
                }
                this.setState({
                    taskList: tasks,
                })
            }).catch((reason) => { throw "Error when parsing task items: " + reason; })
        }).catch((reason) => { throw "Error when generate tasks from vault: " + reason; })
    }

    handleCreateNewTask(path: string, append: string) {
        const taskStr = "- [ ] " + append + "\n";
        const section = this.options.section;
        this.app.vault.adapter.exists(path).then(exist => {
            if (!exist && confirm("No such file: " + path + ". Would you like to create it?")) {
                const content = section + "\n\n" + taskStr;
                this.app.vault.create(path, content).catch(reason => {
                    return new Notice("Error when creating file " + path + " for new task: " + reason);
                });
                return;
            }
            this.app.vault.adapter.read(path).then(content => {
                const lines = content.split('\n');
                lines.splice(lines.indexOf(section) + 1, 0, taskStr);
                this.app.vault.adapter.write(path, lines.join("\n"))
                    .catch(reason => {
                        return new Notice("Error when writing new tasks to " + path + "." + reason, 5000);
                    });
            }).catch(reason => new Notice("Error when reading file " + path + "." + reason, 5000));
        })
    }


    handleTagClick(tag: string) {
        //@ts-ignore
        const searchPlugin = this.app.internalPlugins.getPluginById("global-search");
        const search = searchPlugin && searchPlugin.instance;
        search.openGlobalSearch('tags:' + tag)
    }

    handleOpenFile(path: string, position: Pos) {
        this.app.vault.adapter.exists(path).then(exist => {
            if (!exist) {
                new Notice("No such file: " + path, 5000);
                return;
            }
            this.app.workspace.openLinkText('', path).then(() => {
                try {
                    const file = this.app.workspace.getActiveFile();
                    this.app.workspace.getLeaf().openFile(file!, { state: { mode: "source" } });
                    this.app.workspace.activeEditor?.editor?.setSelection(
                        { line: position.start.line, ch: position.start.col },
                        { line: position.end.line, ch: position.end.col }
                    )
                    if (!this.app.workspace.activeEditor?.editor?.hasFocus())
                        this.app.workspace.activeEditor?.editor?.focus();
                } catch (err) {
                    new Notice("Error when trying open file: " + err, 5000);
                }
            })
        }).catch(reason => {
            new Notice("Something went wrong: " + reason);
        })
    }

    handleCompleteTask(path: string, position: Pos) {
        this.app.workspace.openLinkText('', path).then(() => {
            const file = this.app.workspace.getActiveFile();
            this.app.workspace.getLeaf().openFile(file!, { state: { active: false } });
            this.app.workspace.activeEditor?.editor?.setSelection(
                { line: position.start.line, ch: position.start.col },
                { line: position.end.line, ch: position.end.col }
            );
            const task = this.app.workspace.activeEditor?.editor?.getSelection();
            if (!task) return;
            const match = task.match(TaskRegularExpressions.taskRegex);
            if (!match || match.length < 5) return;
            const newTask = [match[1], match[2], ((match[3] === ' ') ? '[x]' : '[ ]'), match[4]].join(' ').trimStart();
            this.app.workspace.activeEditor?.editor?.replaceSelection(newTask);
        })
    }

    render(): React.ReactNode {
        console.log(this.state.taskList)
        return (
            <CreateNewTaskContext.Provider value={{ handleCreateNewTask: this.handleCreateNewTask }}>
                <TaskItemEventHandlersContext.Provider value={{
                    handleOpenFile: this.handleOpenFile,
                    handleCompleteTask: this.handleCompleteTask,
                    handleTagClick: this.handleTagClick,
                }}>
                    <TimelineView userOptions={this.options} taskList={this.state.taskList} />
                </TaskItemEventHandlersContext.Provider>
            </CreateNewTaskContext.Provider>
        )
    }
}