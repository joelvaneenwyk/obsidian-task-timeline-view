import moment, { Moment } from "moment";
import * as React from "react";
import { getFileTitle } from "../../../dataview-util/dataview";
import { innerDateFormat, recurrenceSymbol, TaskDataModel, TaskRegularExpressions, TaskStatus } from "../utils/tasks";
import * as Icons from './asserts/icons';
import { TaskItemEventHandlersContext } from "./context";

const getRelative = (someDate: Moment) => {
    if (moment().diff(someDate, 'days') >= 1 || moment().diff(someDate, 'days') <= -1) {
        return someDate.fromNow();
    } else {
        return someDate.calendar().split(' ')[0];
    };
};

const defaultTaskItemProps = {
    taskItem: {} as TaskDataModel,
}

type TaskItemProps = Readonly<typeof defaultTaskItemProps>;

export class TaskItemView extends React.Component<TaskItemProps> {

    render(): React.ReactNode {
        const item = this.props.taskItem;
        const display = item.visual || item.text;
        const line = item.line;
        const col = item.position.end.col;
        const link = item.link.path.replace("'", "&apos;");
        const isDailyNote = item.dailyNote;
        const status = item.status;
        const color = item.fontMatter["color"]?.[0];
        const ariaLabel = getFileTitle(item.path);
        const statusIcon = Icons.getTaskStatusIcon(status);
        return (
            <TaskItemEventHandlersContext.Consumer>{callbacks => {
                const openTaskFile = () => {
                    callbacks.handleOpenFile(item.path, item.position);
                };
                const onCompleteTask = () => {
                    callbacks.handleCompleteTask(item.path, item.position);
                }
                return (<div data-line={line} data-col={col} data-link={link} data-dailynote={isDailyNote}
                    className={`task ${status}`}
                    style={{ "--task-color": color || "var(--text-muted)" } as React.CSSProperties} aria-label={ariaLabel}>
                    <StripWithIcon status={status} onClick={onCompleteTask} />
                    <div className='lines' onClick={openTaskFile}>
                        <a className='internal-link' href={link} target="_blank" rel="noopener">
                            <div className='content'>{display}</div>
                        </a>
                        <div className='line info'>
                            {item.created &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='relative' ariaLabel={"create at " + item.created.format(innerDateFormat)}
                                    label={getRelative(item.created)} icon={Icons.taskIcon} />}
                            {item.start &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='relative' ariaLabel={"start at " + item.start.format(innerDateFormat)}
                                    label={getRelative(item.start)} icon={Icons.startIcon} />}
                            {item.scheduled &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='relative' ariaLabel={"scheduled to " + item.scheduled.format(innerDateFormat)}
                                    label={getRelative(item.scheduled)} icon={Icons.scheduledIcon} />}
                            {item.due &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='relative' ariaLabel={"due at " + item.due.format(innerDateFormat)}
                                    label={getRelative(item.due)} icon={Icons.dueIcon} />}
                            {item.completion &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='relative' ariaLabel={"complete at " + item.completion.format(innerDateFormat)}
                                    label={getRelative(item.completion)} icon={Icons.doneIcon} />}

                            {item.recurrence &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='repeat' ariaLabel={'recurrent: ' + item.recurrence.replace(recurrenceSymbol, '')}
                                    label={item.recurrence.replace(recurrenceSymbol, '')} icon={Icons.repeatIcon} />}

                            {item.priorityLabel &&
                                <DateStatusBadge //onClick={openTaskFile}
                                    className='priority' ariaLabel={'priority: ' + item.priorityLabel}
                                    label={item.priorityLabel} icon={Icons.priorityIcon} />}
                            <FileBadge filePath={item.path} subPath={item.section.subpath || ""} />

                            {item.tags.map((t, i) => <TagBadge tag={t} key={i} />)}
                        </div>
                    </div>
                </div>)
            }}
            </TaskItemEventHandlersContext.Consumer>)
    }
}


const defaultStripWithIconProps = {
    status: "task",
    onClick: () => { },
}

type StripWithIconProps = Readonly<typeof defaultStripWithIconProps>

class StripWithIcon extends React.Component<StripWithIconProps> {
    render(): React.ReactNode {
        return (
            <div className='timeline' onClick={this.props.onClick}>
                <div className='icon'>{Icons.getTaskStatusIcon(this.props.status)}</div>
                <div className='stripe'></div>
            </div>
        )
    }
}

const defaultTagBadgeProps = {
    tag: "",
};

type TagBadgeProps = Readonly<typeof defaultTagBadgeProps>;

class TagBadge extends React.Component<TagBadgeProps> {

    render(): React.ReactNode {
        const tag = this.props.tag;
        var tagText = tag.replace("#", "");
        const hexColorMatch = tag.match(TaskRegularExpressions.hexColorRegex);
        var style: {};
        if (hexColorMatch) {
            style = {
                '--tag-color': `#${hexColorMatch[1]}`,
                '--tag-background': `#${hexColorMatch[1]}1a`,
                'zIndex': 9999,
            };
            tagText = hexColorMatch[2];
        } else {
            style = {
                '--tag-color': 'var(--text-muted)',
                'zIndex': 9999,
            };
        };
        return (
            <TaskItemEventHandlersContext.Consumer>{callbacks => (
                <a href={tag} className={'tag'} target='_blank' rel='noopener' style={style} aria-label={tag}
                    onClick={(e) => {
                        e.stopPropagation();
                        callbacks.handleTagClick(tag);
                    }}>
                    <div className='icon'>{Icons.tagIcon}</div>
                    <div className='label'>{tagText}</div>
                </a>)}
            </TaskItemEventHandlersContext.Consumer>
        );
    }
}

const defaultFileBadgeProps = {
    filePath: "",
    subPath: "",
}

type FileBadgeProps = Readonly<typeof defaultFileBadgeProps>;
class FileBadge extends React.Component<FileBadgeProps> {
    render(): React.ReactNode {
        const filePath = this.props.filePath;
        const fileName = getFileTitle(filePath);
        const subPath = this.props.subPath;
        return (
            <div className='file' aria-label={filePath}>
                <div className='icon'>{Icons.fileIcon}</div>
                <div className='label'>{fileName}</div>
                <span className='header'>{subPath}</span>
            </div>)
    }
}

const defaultBadgeProps = {
    className: "",
    ariaLabel: "",
    label: "",
    icon: Icons.taskIcon,
    //onClick: () => { },
}

type BadgeProps = Readonly<typeof defaultBadgeProps>;

class DateStatusBadge extends React.Component<BadgeProps> {

    render(): React.ReactNode {
        const type = this.props.className;
        const aria_label = this.props.ariaLabel;
        const label = this.props.label;
        const icon = this.props.icon;
        return (
            <div className={type} aria-label={aria_label} /*onClick={this.props.onClick}*/>
                <div className='icon'>{icon}</div>
                <div className='label'>{label}</div>
            </div>
        );
    }
}