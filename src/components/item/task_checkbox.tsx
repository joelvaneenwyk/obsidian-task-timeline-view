import React from "react";
import { Checkbox } from "@nextui-org/react";
import { TaskDataModel } from "../../../../utils/tasks";
import TaskInfoLine from "./info_line";
function TaskCheckbox({
    item,
}: {
    item: TaskDataModel,
}) {
    const taskItemContent = item.visual || "";
    return (
        <Checkbox>
            <div>
                <a>{taskItemContent}</a>
                <TaskInfoLine item={item} />
            </div>
        </Checkbox>
    )
}

export default TaskCheckbox;