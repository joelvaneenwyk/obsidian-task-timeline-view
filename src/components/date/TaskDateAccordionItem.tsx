import React from "react";
import { AccordionItem } from "@nextui-org/react";
import moment from "moment";
import { TaskDataModel, innerDateFormat } from "../../../../utils/tasks";
import TaskItemCheckbox from "../item/TaskItemCheckbox";

function TaskDateAccordionItem({
    date,
    taskList,
}: {
    date: moment.Moment,
    taskList: TaskDataModel[],
}) {
    const formattedDate = date.format(innerDateFormat);
    return (
        <AccordionItem
            aria-label={date.format(formattedDate)}
            title={formattedDate}
            // className=" grid"
            classNames={{
                content: "grid grid-cols-1 gap-4"
            }}
        >
            {taskList.map((t, i) => <TaskItemCheckbox key={i} item={t} />)}
        </AccordionItem>
    )
}

export default TaskDateAccordionItem;