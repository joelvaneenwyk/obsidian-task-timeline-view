import moment, { Moment } from 'moment';
import * as React from 'react';
import { Options } from '../utils/options';
import { innerDateFormat, TaskDataModel, TaskMapable, TaskStatus } from '../utils/tasks';
import { YearView } from './yearview';



const defaultTimelineProps = {
    tasks: [] as TaskDataModel[],
    userOptions: {} as Options,
}
type TimelineProps = Readonly<typeof defaultTimelineProps>;
export class TimelineView extends React.Component<TimelineProps> {
    //private calendar: Map<string, Set<number>> = new Map();
    private options = {} as Options;
    private tasks = [] as TaskDataModel[];
    constructor(props: TimelineProps) {
        super(props);
    }
    render(): React.ReactNode {

        const involvedDates: Set<string> = new Set();

        this.tasks.forEach((t: TaskDataModel) => {
            t.due && involvedDates.add(t.due.format(innerDateFormat));
            t.scheduled && involvedDates.add(t.scheduled.format(innerDateFormat));
            t.created && involvedDates.add(t.created.format(innerDateFormat));
            t.start && involvedDates.add(t.start.format(innerDateFormat));
            t.completion && involvedDates.add(t.completion.format(innerDateFormat));
            t.dates.forEach((d: Moment, k: string) => {
                involvedDates.add(d.format(innerDateFormat));
            });
        })

        if (!involvedDates.has(moment().format(innerDateFormat)))
            involvedDates.add(moment().format(innerDateFormat));

        const sortedDatas = [...involvedDates].sort();

        const earliestYear: number = +moment(sortedDatas[0].toString()).format("YYYY");
        const latestYear: number = +moment(sortedDatas[sortedDatas.length - 1].toString()).format("YYYY");

        const daysOfYears = []
        const tasksOfYears: TaskDataModel[][] = []
        for (let y = earliestYear; y < latestYear + 1; ++y) {
            const daysOfThisYear = sortedDatas.filter(d => moment(d).year() === y);
            //if (daysOfThisYear.length === 0) continue;
            daysOfYears.push(daysOfThisYear);
            const tasksOfThisYear = this.tasks.filter(TaskMapable.filterYear(moment().year(y)));
            //if (tasksOfThisYear.length === 0) continue;
            tasksOfYears.push(tasksOfThisYear);
        }

        const styles = this.options.options ? this.options.options.join(" ") : "";
        return (
            <div className={`taskido ${styles}`} id={`taskido ${(new Date()).getTime()}`}>
                <span>
                    {daysOfYears.map((ds, idx) => (
                        <YearView datesOfThisYear={ds.map((d, i) => moment(d))} tasksOfThisYear={tasksOfYears[idx]} key={idx}/>
                    ))}
                </span>
            </div>
        );
    }
}