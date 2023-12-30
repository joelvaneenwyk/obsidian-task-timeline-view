import IconOnlyBadge from "./IconOnlyBadge";
import TagBadge from "./TagBadge";
import { TaskDataModel, recurrenceSymbol } from "../../../../utils/tasks";
import { MouseEventHandler } from "react";
import { getFileTitle } from "../../util";
import { iconMap } from "../asserts/icons";
import { TaskItemEventHandlersContext } from "../context"
import IconDateBadge from "./IconDateBadge";
import IconTextBadge from "./IconTextBadge";

function TaskInfoLine({
    item,
    onModifyTask,
}: {
    item: TaskDataModel
    onModifyTask?: MouseEventHandler,

}) {
    return (
        <div className="flex flex-col flex-wrap gap-1">
            <div key="datetime" className="flex flex-wrap gap-1">
                {onModifyTask &&
                    <IconOnlyBadge key={1} onclick={onModifyTask} />}
                {item.created &&
                    <IconDateBadge key={2}
                        ariaLabelPrefix="create at "
                        date={item.created}
                        icon={iconMap.taskIcon}
                    />}
                {item.start &&
                    <IconDateBadge key={3}
                        ariaLabelPrefix="start at "
                        date={item.start}
                        icon={iconMap.startIcon}
                    />}
                {item.scheduled &&
                    <IconDateBadge key={4}
                        ariaLabelPrefix="scheduled to "
                        date={item.scheduled}
                        icon={iconMap.scheduledIcon}
                    />}
                {item.due &&
                    <IconDateBadge key={5}
                        ariaLabelPrefix="due at "
                        date={item.due}
                        icon={iconMap.dueIcon}
                        color="text-danger"
                    />}
                {item.completion &&
                    <IconDateBadge key={6}
                        ariaLabelPrefix="complete at "
                        date={item.completion}
                        icon={iconMap.doneIcon}
                        color="text-success"
                    />}
                {item.recurrence &&
                    <IconTextBadge key={7}
                        ariaLabelPrefix="recurrent: "
                        ariaLabel={item.recurrence.replace(recurrenceSymbol, '')}
                        label={item.recurrence.replace(recurrenceSymbol, '')}
                        icon={iconMap.repeatIcon}
                    />}
                {item.priority &&
                    <IconTextBadge key={8}
                        ariaLabelPrefix="priority: "
                        ariaLabel={item.priority}
                        label={item.priority.length > 0 ? item.priority + "Priority" : "No Priority"}
                        icon={iconMap.priorityIcon}
                    />}
                <IconTextBadge key={9}
                    ariaLabel={item.path}
                    label={getFileTitle(item.path)}
                    labelSuffix={item.section.subpath && item.section.subpath?.length > 0 ?
                        (" > " + item.section.subpath) : ""}
                    icon={iconMap.fileIcon}
                />
            </div>
            <div key="tags" className="flex-wrap">
                {[...new Set(item.tags)].map((t, i) => {
                    return (
                        <TaskItemEventHandlersContext.Consumer key={i}>
                            {({ handleTagClick }) => (
                                <TagBadge key={i}
                                    tag={t}
                                    tagPalette={{} as Map<string, string>}
                                    onTagClick={handleTagClick}
                                />
                            )}
                        </TaskItemEventHandlersContext.Consumer>
                    )
                })}
            </div>
        </div>
    )
}

export default TaskInfoLine;