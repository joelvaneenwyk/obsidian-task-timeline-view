import moment, { Moment } from 'moment';
import * as React from 'react';
import { Options } from '../utils/options';
import { innerDateFormat, TaskDataModel, TaskMapable, TaskStatus } from '../utils/tasks';
import { YearView } from './yearview';
import { UserOptionContext, TodayFocusEventHandlersContext } from './context';


const defaultTimelineProps = {
    userOptions: {} as Options,
    taskList: [] as TaskDataModel[],
}
const defaultTimelineStates = {
    filter: "" as string,
    todayFocus: false as boolean,
}
type TimelineProps = Readonly<typeof defaultTimelineProps>;
type TimelineStates = typeof defaultTimelineStates;
export class TimelineView extends React.Component<TimelineProps, TimelineStates> {
    //private calendar: Map<string, Set<number>> = new Map();
    constructor(props: TimelineProps) {
        super(props);

        this.handleCounterFilterClick = this.handleCounterFilterClick.bind(this);
        this.handleTodayFocus = this.handleTodayFocus.bind(this);

        this.state = {
            filter: "",
            todayFocus: false,
        }
    }

    handleCounterFilterClick(filterName: string) {
        if (this.state.filter !== filterName) {
            this.setState({
                filter: filterName,
            })
        }else{
            this.setState({
                filter: ""
            })
        }
    }

    handleTodayFocus() {
        this.setState({
            todayFocus: !this.state.todayFocus,
        })
    }

    render(): React.ReactNode {
    
        const involvedDates: Set<string> = new Set();

        this.props.taskList.forEach((t: TaskDataModel) => {
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
            const tasksOfThisYear = this.props.taskList.filter(TaskMapable.filterYear(moment().year(y)));
            //if (tasksOfThisYear.length === 0) continue;
            tasksOfYears.push(tasksOfThisYear);
        }

        const todoCount: number = this.props.taskList.filter(t => !t.completed &&
            t.status !== TaskStatus.overdue && t.status !== TaskStatus.unplanned).length;
        const overdueCount: number = this.props.taskList.filter(t => t.status === TaskStatus.overdue).length;
        const unplannedCount: number = this.props.taskList.filter(t => t.status === TaskStatus.unplanned).length;

        const styles = [...this.props.userOptions.options].join(" ");
        return (
            <div className={`taskido ${styles} ${this.state.filter} ${this.state.todayFocus ? "todayFocus" : ""}`} id={`taskido${(new Date()).getTime()}`}>
                <TodayFocusEventHandlersContext.Provider value={{ handleTodayFocusClick: this.handleTodayFocus }}>
                    <UserOptionContext.Provider value={{
                        taskFiles: this.props.userOptions.taskFiles,
                        select: this.props.userOptions.select,
                        counters: [
                            {
                                onClick: () => { this.handleCounterFilterClick('todoFilter') },
                                cnt: todoCount,
                                label: "Todo",
                                id: "todo",
                                ariaLabel: "Filter Todo Tasks"
                            }, {
                                onClick: () => { this.handleCounterFilterClick('overdueFilter') },
                                cnt: overdueCount,
                                id: "overdue",
                                label: "Overdue",
                                ariaLabel: "Filter Overdue Tasks"
                            }, {
                                onClick: () => { this.handleCounterFilterClick('unplannedFilter') },
                                cnt: unplannedCount,
                                id: "unplanned",
                                label: "Unplanned",
                                ariaLabel: "Filter Unplanned Tasks"
                            }
                        ]
                    }}>
                        <span>
                            {daysOfYears.map((ds, idx) => (
                                <YearView datesOfThisYear={ds.map((d, i) => moment(d))} tasksOfThisYear={tasksOfYears[idx]} key={idx} />
                            ))}
                        </span>
                    </UserOptionContext.Provider>
                </TodayFocusEventHandlersContext.Provider>
            </div>
        );
    }
}