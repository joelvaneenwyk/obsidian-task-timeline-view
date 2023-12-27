import { Accordion } from "@nextui-org/react";
import React from "react";
import { TaskDataModel } from '../../../../utils/tasks';
import moment from "moment";
import TaskDateItemAccordionItem from "../date/date_view_accordion_item";

function YearAccordion({
    year,
    dateTaskMap,
}: {
    year: number,
    dateTaskMap: Map<moment.Moment, TaskDataModel[]>
}) {
    const dates = [...dateTaskMap.keys()]
        .sort((a, b) => {
            if (a.isBefore(b)) return -1;
            else if (a.isAfter(b)) return 1;
            return 0;
        });
    return (
        <Accordion
            title={year.toString()}
        >
            {dates.map((d, i) =>
                <TaskDateItemAccordionItem key={i}
                    date={d}
                    taskList={dateTaskMap.get(d) || []}
                />
            )}
        </Accordion>
    )
}

export default YearAccordion;