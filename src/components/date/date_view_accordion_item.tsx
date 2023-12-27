import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import moment from "moment";
import { TaskDataModel, innerDateFormat } from "../../../../utils/tasks";
import TaskCheckbox from "../item/task_checkbox";

function TaskDateAccordionItem({
    date,
    taskList,
}: {
    date: moment.Moment,
    taskList: TaskDataModel[],
}) {
    const formattedDate = date.format(innerDateFormat);
    return (
        <Accordion>
            <AccordionItem
                aria-label={date.format(formattedDate)}
                title={formattedDate}
                // className=" grid"
                classNames={{
                    content: "grid grid-cols-1"
                }}
            >
                {taskList.map((t, i) => <TaskCheckbox key={i} item={t} />)}
            </AccordionItem>
        </Accordion >
    )
}

export default TaskDateAccordionItem;