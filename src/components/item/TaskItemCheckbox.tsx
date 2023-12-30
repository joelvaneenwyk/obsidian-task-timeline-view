import React from "react";
import { Checkbox } from "@nextui-org/react";
import { TaskDataModel } from "../../../../utils/tasks";
import TaskInfoLine from "./TaskInfoLine";
function TaskItemCheckbox({
    item,
}: {
    item: TaskDataModel,
}) {
    const taskItemContent = item.visual || "";
    return (
        <>
            <Checkbox
                // className=" after:content-[''] after:my-1 after:w-1"
                classNames={{
                    icon: "",
                    wrapper: "align-top"
                }}
            >
                <a className=" pl-1">{taskItemContent}</a>

            </Checkbox>
            <div className="flex">
                <div
                    className="flex-shrink-0 w-5 mr-2 pt-1 pb-1 flex justify-center after:flex after:content[''] after:w-[1px] after:h-full after:bg-black"
                />
                <TaskInfoLine item={item} />
            </div>
        </>
    )
}

export default TaskItemCheckbox;