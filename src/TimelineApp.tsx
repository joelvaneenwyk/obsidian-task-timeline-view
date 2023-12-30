import React from "react";
import { TaskDataModel, innerDateFormat } from "../../utils/tasks";
import { NextUIProvider } from "@nextui-org/react";
import moment from "moment";
import YearAccordion from "./components/year/YearAccordion";
import * as TaskMapable from '../../utils/taskmapable';
import InputPanel from "./components/input/InputPanel";
import Filter from './components/filter/Filter';
function TimelineApp({
    taskList,
}: {
    taskList: TaskDataModel[],
}) {

    taskList = taskList.map((t) => {
        t.dates.set("today", moment());
        return t;
    })

    const sortedInvolvedDates = taskList.flatMap((t) => {
        const dates: moment.Moment[] = new Array<moment.Moment>();
        t.created && dates.push(t.created);
        t.start && dates.push(t.start);
        t.scheduled && dates.push(t.scheduled);
        t.completion && dates.push(t.completion);
        t.dates && dates.concat(...t.dates.values());
        return dates.unique()
    })
        .unique()
        .sort((a, b) => {
            if (a.isBefore(b)) return -1;
            else if (a.isAfter(b)) return 1;
            return 0;
        });

    const sortedInvolvedYears: number[] = sortedInvolvedDates.flatMap((d) => {
        return +d.format("YYYY");
    })
        .unique()
        .sort((a, b) => a - b);

    const yearDateTaskMap: Map<number, Map<string, TaskDataModel[]>> =
        new Map(
            sortedInvolvedYears.map((y) => {
                return {
                    key: y,
                    value: new Map(
                        sortedInvolvedDates
                            .filter((d) => d.year() === y)
                            .map((d) => {
                                return {
                                    key: d.format(innerDateFormat),
                                    value: taskList.filter(TaskMapable.filterDate(d))
                                }
                            })
                            .map(e => [e.key, e.value])
                    )
                };
            }).map(e => [e.key, e.value])
        );


    console.log(yearDateTaskMap);
    return (
        <NextUIProvider>
            <InputPanel
                newItemDestinationOptions={["a", "b", "ccc"]}
            />
            <Filter />
            {sortedInvolvedYears.map((y) => (
                <YearAccordion key={y}
                    year={y}
                    dateTaskMap={yearDateTaskMap.get(y) || {} as Map<string, TaskDataModel[]>}
                />
            ))}
        </NextUIProvider>
    )
}

export default TimelineApp;