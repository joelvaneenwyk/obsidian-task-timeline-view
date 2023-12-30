import moment, { Moment } from "moment";
import { MarkdownRenderer } from "obsidian";
import * as React from "react";
import { getFileTitle } from "../../../dataview-util/dataview";
import { TasksTimelineView } from "../../../src/views";
import { TaskDataModel, recurrenceSymbol } from "../../../utils/tasks";
import * as Icons from './asserts/icons';
import { TaskItemEventHandlersContext, UserOptionContext } from "./context";
// import ModifyBadge from "./item/modify_badge";
// import DateStatusBadge from "./item/date_badge"
// import FileBadge from "./item/file_badge";
// import TagBadge from "./item/tag_badge";
import TaskItemCheckbox from "./item/TaskItemCheckbox";
import TaskInfoLine from "./item/TaskInfoLine";

const getRelative = (someDate: Moment) => {
    if (moment().diff(someDate, 'days') >= 1 || moment().diff(someDate, 'days') <= -1) {
        return someDate.fromNow();
    } else {
        return someDate.calendar().split(' ')[0];
    }
};

const defaultTaskItemProps = {
    taskItem: {} as TaskDataModel
}

type TaskItemProps = Readonly<typeof defaultTaskItemProps>;
const defaultTaskItemState = {
    taskStatus: "task" as string,
}
type TaskItemState = typeof defaultTaskItemState;
export class TaskItemView extends React.Component<TaskItemProps, TaskItemState> {
    constructor(props: TaskItemProps) {
        super(props);
        this.state = {
            taskStatus: "task",
        }
    }

    render(): React.ReactNode {
        const item = this.props.taskItem;
        const display = item.visual || item.text;
        const line = item.line;
        const col = item.position.end.col;
        const link = item.link.path.replace("'", "&apos;");
        const isDailyNote = item.dailyNote;
        const color = item.fontMatter["color"];
        const ariaLabel = getFileTitle(item.path);
        const tags = [...new Set(item.tags)];
        //const outlinks = item.outlinks;

        const path = item.path;
        const position = item.position;
        return (
            <TaskItemEventHandlersContext.Consumer>{
                callbacks => {
                    const openTaskFile = () => {
                        callbacks.handleOpenFile(path, position);
                    };
                    const onToggleTask = () => {
                        callbacks.handleCompleteTask(path, position);
                    };
                    const onModifyTask = () => {
                        callbacks.handleModifyTask(path, position);
                    };
                    return (
                        <UserOptionContext.Consumer>{
                            ({ dateFormat, hideTags, useBuiltinStyle }) =>
                            (<div data-line={line} data-task={item.statusMarker} data-col={col} data-link={link} data-dailynote={isDailyNote}
                                className={`task ${item.status}`}
                                style={{ "--task-color": color || "var(--text-muted)" } as React.CSSProperties} aria-label={ariaLabel}>
                                {/* <StripWithIcon onToggle={onToggleTask} useBuiltinStyle={useBuiltinStyle}
                                    marker={item.statusMarker} status={item.status} /> */}
                                <div className='lines' onClick={openTaskFile}>
                                    {/* <div className="content">
                                        <Content display={display} fileName={item.path} />
                                    </div> */}
                                    <TaskItemCheckbox content={display}></TaskItemCheckbox>
                                    <TaskInfoLine item={item}
                                        onModifyTask={onModifyTask}
                                    />
                                    {/* <div className='line info'>
                                        {callbacks.handleModifyTask &&
                                            <ModifyBadge onclick={onModifyTask}></ModifyBadge>}
                                        {item.created &&
                                            <DateStatusBadge key={1}//onClick={openTaskFile}
                                                className='relative' ariaLabel={"create at " + item.created.format(dateFormat)}
                                                label={getRelative(item.created)} icon={Icons.taskIcon} />}
                                        {item.start &&
                                            <DateStatusBadge key={2}//onClick={openTaskFile}
                                                className='relative' ariaLabel={"start at " + item.start.format(dateFormat)}
                                                label={getRelative(item.start)} icon={Icons.startIcon} />}
                                        {item.scheduled &&
                                            <DateStatusBadge key={3}//onClick={openTaskFile}
                                                className='relative' ariaLabel={"scheduled to " + item.scheduled.format(dateFormat)}
                                                label={getRelative(item.scheduled)} icon={Icons.scheduledIcon} />}
                                        {item.due &&
                                            <DateStatusBadge key={4}//onClick={openTaskFile}
                                                className='relative' ariaLabel={"due at " + item.due.format(dateFormat)}
                                                label={getRelative(item.due)} icon={Icons.dueIcon} />}
                                        {item.completion &&
                                            <DateStatusBadge key={5}//onClick={openTaskFile}
                                                className='relative' ariaLabel={"complete at " + item.completion.format(dateFormat)}
                                                label={getRelative(item.completion)} icon={Icons.doneIcon} />}

                                        {item.recurrence &&
                                            <DateStatusBadge key={6}//onClick={openTaskFile}
                                                className='repeat' ariaLabel={'recurrent: ' + item.recurrence.replace(recurrenceSymbol, '')}
                                                label={item.recurrence.replace(recurrenceSymbol, '')} icon={Icons.repeatIcon} />}

                                        {item.priority &&
                                            <DateStatusBadge key={7}//onClick={openTaskFile}
                                                className='priority' ariaLabel={'priority: ' + item.priority}
                                                label={item.priority.length > 0 ? item.priority + " Priority" : "No Priority"}
                                                icon={Icons.priorityIcon} />}
                                        <FileBadge filePath={item.path} subPath={item.section.subpath || ""} />
                                        {[...new Set(tags)].filter(t => !hideTags.includes(t)).map((t, i) => {
                                            return (
                                                <TaskItemEventHandlersContext.Consumer>
                                                    {({ handleTagClick }) =>
                                                    (<TagBadge
                                                        tag={t} key={i}
                                                        tagPalette={{} as Map<string, string>}
                                                        onTagClick={handleTagClick}
                                                    ></TagBadge>)
                                                    }
                                                </TaskItemEventHandlersContext.Consumer>
                                            )

                                        }
                                        )}
                                    </div> */}
                                </div>
                            </div>)}
                        </UserOptionContext.Consumer>
                    )
                }}
            </TaskItemEventHandlersContext.Consumer>
        )
    }
}

const defaultContentProps = {
    display: "",
    fileName: "",
}
type ContentProps = Readonly<typeof defaultContentProps>
class Content extends React.Component<ContentProps> {
    render(): React.ReactNode {
        const cont = createEl("a")
        MarkdownRenderer.renderMarkdown(this.props.display, cont, this.props.fileName, TasksTimelineView.view!);
        return <a dangerouslySetInnerHTML={{ __html: cont.firstElementChild!.innerHTML }} />
    }
}


const defaultStripWithIconProps = {
    status: "task",
    marker: " ",
    useBuiltinStyle: true,
    onToggle: () => { },
}

type StripWithIconProps = Readonly<typeof defaultStripWithIconProps>
class StripWithIcon extends React.Component<StripWithIconProps> {

    render(): React.ReactNode {
        return (
            <div className='timeline' >
                <input id="statusMarker" type="checkbox" className={this.props.useBuiltinStyle ? "icon" : ""}
                    data-task={this.props.marker}
                    defaultChecked={this.props.marker !== ' '} onClick={() => {
                        if (!this.props.useBuiltinStyle) this.props.onToggle();
                    }}></input>
                {this.props.useBuiltinStyle &&
                    <label htmlFor="statusMarker" className="icon" onClick={() => {
                        if (this.props.useBuiltinStyle) this.props.onToggle();
                    }}>{Icons.getTaskStatusIcon(this.props.status)}</label>}
            </div>
        )
    }
}

// const defaultTagBadgeProps = {
//     tag: "",
// };

// type TagBadgeProps = Readonly<typeof defaultTagBadgeProps>;

// class TagBadge extends React.Component<TagBadgeProps> {

//     render(): React.ReactNode {
//         return (
//             <UserOptionContext.Consumer>{({ tagPalette }) => {
//                 const tag = this.props.tag;
//                 const tagText = tag.replace("#", "");
//                 let color;
//                 if (Object.keys(tagPalette).contains(tag)) color = tagPalette[tag];
//                 let style: Record<string, unknown>;
//                 if (color) {
//                     style = {
//                         '--tag-color': color,
//                         '--tag-background': `${color}1a`,
//                         'zIndex': 9999,
//                     };
//                 } else {
//                     style = {
//                         '--tag-color': 'var(--text-muted)',
//                         'zIndex': 9999,
//                     };
//                 }
//                 return (
//                     <TaskItemEventHandlersContext.Consumer>{callbacks => (
//                         <a href={tag} className={'tag'} target='_blank' rel='noopener' style={style} aria-label={tag}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 callbacks.handleTagClick(tag);
//                             }}>
//                             <div className='icon'>{Icons.tagIcon}</div>
//                             <div className='label'>{tagText}</div>
//                         </a>)}
//                     </TaskItemEventHandlersContext.Consumer>)
//             }}
//             </UserOptionContext.Consumer>
//         );
//     }
// }

