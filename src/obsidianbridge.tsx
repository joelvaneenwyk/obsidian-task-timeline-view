import * as React from 'react'
import { App, Pos, Notice } from 'obsidian'
import { CreateNewTaskContext, TaskItemEventHandlersContext } from './components/context'
import { TimelineSettings } from './utils/options';
import { TaskDataModel, TaskMapable, TaskRegularExpressions, TaskStatus } from './utils/tasks';
import { ObsidianTaskAdapter } from './taskadapter';
import { TimelineView } from './components/timelineview';
import moment from 'moment';
import {} from './utils/options'

const defaultObsidianBridgeProps = {
    app: {} as App,
}
const defaultObsidianBridgeState = {
    taskList: [] as TaskDataModel[],
}
type ObsidianBridgeProps = Readonly<typeof defaultObsidianBridgeProps>;
type ObsidianBridgeState = typeof defaultObsidianBridgeState;
export class ObsidianBridge extends React.Component<ObsidianBridgeProps, ObsidianBridgeState> {
    private options: TimelineSettings;
    private adapter: ObsidianTaskAdapter;
    constructor(props: ObsidianBridgeProps){
        super(props);
        
        this.options = Object.assign({}, {}, new TimelineSettings());

        this.handleCreateNewTask = this.handleCreateNewTask.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleOpenFile = this.handleOpenFile.bind(this);
        this.handleCompleteTask = this.handleCompleteTask.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.parseTasks = this.parseTasks.bind(this);

        this.adapter = new ObsidianTaskAdapter(this.props.app);
        
        this.state = {
            taskList: [],
        }
    }

    componentDidMount(): void {
        this.props.app.vault.on("create", this.onUpdate);
        this.props.app.vault.on("delete", this.onUpdate);
        this.props.app.vault.on("modify", this.onUpdate);
        this.props.app.vault.on("rename", this.onUpdate);
        this.onUpdate()
    }

    onUpdate(){
        console.log("UPDATE")
        //this.adapter.generateTasksList();
        const tasks = this.parseTasks();
        if (this.options.taskFiles.size === 0) {
            tasks.forEach(t => {
                this.options.taskFiles.add(t.path);
            })
        }
        this.setState({
            taskList: [...tasks],
        })
    }
    
    parseTasks() {
        const orderMap: Map<string, number> = new Map();
        [...this.options.taskOrder].forEach((value: string, index: number) => {
            orderMap.set(value, index);
        });

        return this.adapter.getTaskList()
            .map(TaskMapable.tasksPluginTaskParser)
            .map(TaskMapable.dataviewTaskParser)
            .map(TaskMapable.dailyNoteTaskParser())
            .map(TaskMapable.taskLinkParser)
            .map(TaskMapable.remainderParser)
            .map(TaskMapable.postProcessor)
            .map((t: TaskDataModel) => {
                t.order = orderMap.get(t.status) || 0;
                return t;
            })
            .map((t: TaskDataModel) => {
                if (t.status === TaskStatus.unplanned) t.dates.set("unplanned", moment())
                else if (t.status === TaskStatus.done && !t.completion &&
                    !t.due && !t.start && !t.scheduled && !t.created) t.dates.set("done-unplanned", moment());
                return t;
            })
    }

    handleCreateNewTask(path: string, append: string) {
        const taskStr = "- [ ] " + append + "\n";
        const section = this.options.section;
        this.props.app.vault.adapter.exists(path).then(exist => {
            if (!exist && confirm("No such file: " + path + ". Would you like to create it?")) {
                const content = section + "\n\n" + taskStr;
                this.props.app.vault.create(path, content).catch(reason => {
                    return new Notice("Error when creating file " + path + " for new task: " + reason);
                });
                return;
            }
            this.props.app.vault.adapter.read(path).then(content => {
                const lines = content.split('\n');
                lines.splice(lines.indexOf(section) + 1, 0, taskStr);
                this.props.app.vault.adapter.write(path, lines.join("\n"))
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
        search.openGlobalSearch('tags:'+tag)
    }

    handleOpenFile(path: string, position: Pos) {
        this.props.app.vault.adapter.exists(path).then(exist => {
            if (!exist) {
                new Notice("No such file: " + path, 5000);
                return;
            }
            this.props.app.workspace.openLinkText('', path).then(() => {
                try {
                    const file = this.props.app.workspace.getActiveFile();
                    this.props.app.workspace.getLeaf().openFile(file!, { state: { mode: "source" } });
                    this.props.app.workspace.activeEditor?.editor?.setSelection(
                        { line: position.start.line, ch: position.start.col },
                        { line: position.end.line, ch: position.end.col }
                    )
                    if (!this.props.app.workspace.activeEditor?.editor?.hasFocus())
                        this.props.app.workspace.activeEditor?.editor?.focus();
                } catch (err) {
                    new Notice("Error when trying open file: " + err, 5000);
                }
            })
        }).catch(reason => {
            new Notice("Something went wrong: " + reason);
        })
    }

    handleCompleteTask(path: string, position: Pos) {
        this.props.app.workspace.openLinkText('', path).then(() => {
            const file = this.props.app.workspace.getActiveFile();
            this.props.app.workspace.getLeaf().openFile(file!, { state: { active: false } });
            this.props.app.workspace.activeEditor?.editor?.setSelection(
                { line: position.start.line, ch: position.start.col },
                { line: position.end.line, ch: position.end.col }
            );
            const task = this.props.app.workspace.activeEditor?.editor?.getSelection();
            if(!task)return;
            const match = task.match(TaskRegularExpressions.taskRegex);
            if(!match || match.length < 5)return;
            const newTask = [match[1], match[2], ((match[3] === ' ') ? '[x]' : '[ ]'), match[4]].join(' ').trimStart();
            this.props.app.workspace.activeEditor?.editor?.replaceSelection(newTask);
        })
    }

    render(): React.ReactNode {

        return (
            <CreateNewTaskContext.Provider value={{ handleCreateNewTask: this.handleCreateNewTask }}>
                <TaskItemEventHandlersContext.Provider value={{
                    handleOpenFile: this.handleOpenFile,
                    handleCompleteTask: this.handleCompleteTask,
                    handleTagClick: this.handleTagClick,
                }}>
                    <TimelineView userOptions={this.options} taskList={[...this.state.taskList]} />
                </TaskItemEventHandlersContext.Provider>
            </CreateNewTaskContext.Provider>
        )
    }
}