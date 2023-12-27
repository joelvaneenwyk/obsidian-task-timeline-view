import IconOnlyBadge from "./icon_only_badge";
import TagBadge from "./tag_badge";
import { TaskDataModel, recurrenceSymbol } from "../../../../utils/tasks";
import { MouseEventHandler } from "react";
import { getFileTitle } from "../../util";
import { iconMap } from "../asserts/icons";
import { TaskItemEventHandlersContext } from "../context"
import IconDateBadge from "./icon_date_badge";
import IconTextBadge from "./icon_text_badge";

function TaskInfoLine({
    item,
    onModifyTask,
}: {
    item: TaskDataModel
    onModifyTask?: MouseEventHandler,

}) {
    return (
        <div className=" flex-wrap gap-2">
            {onModifyTask &&
                <IconOnlyBadge onclick={onModifyTask} />}
            {item.created &&
                <IconDateBadge key={1}
                    ariaLabelPrefix="create at "
                    date={item.created}
                    icon={iconMap.taskIcon}
                />}
            {item.start &&
                <IconDateBadge key={2}
                    ariaLabelPrefix="start at "
                    date={item.start}
                    icon={iconMap.startIcon}
                />}
            {item.scheduled &&
                <IconDateBadge key={3}
                    ariaLabelPrefix="scheduled to "
                    date={item.scheduled}
                    icon={iconMap.scheduledIcon}
                />}
            {item.due &&
                <IconDateBadge key={4}
                    ariaLabelPrefix="due at "
                    date={item.due}
                    icon={iconMap.dueIcon}
                />}
            {item.completion &&
                <IconDateBadge key={5}
                    ariaLabelPrefix="complete at "
                    date={item.completion}
                    icon={iconMap.doneIcon}
                />}
            {item.recurrence &&
                <IconTextBadge key={1}
                    ariaLabelPrefix="recurrent: "
                    ariaLabel={item.recurrence.replace(recurrenceSymbol, '')}
                    label={item.recurrence.replace(recurrenceSymbol, '')}
                    icon={iconMap.repeatIcon}
                />}
            {item.priority &&
                <IconTextBadge key={2}
                    ariaLabelPrefix="priority: "
                    ariaLabel={item.priority}
                    label={item.priority.length > 0 ? item.priority + "Priority" : "No Priority"}
                    icon={iconMap.priorityIcon}
                />}
            <IconTextBadge
                ariaLabel={item.path}
                label={getFileTitle(item.path)}
                labelSuffix={item.section.subpath && item.section.subpath?.length > 0 ?
                    (" > " + item.section.subpath) : ""}
                icon={iconMap.fileIcon}
            />
            {[...new Set(item.tags)].map((t, i) => {
                return (
                    <TaskItemEventHandlersContext.Consumer>
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
    )
}

export default TaskInfoLine;