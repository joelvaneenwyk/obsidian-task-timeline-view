import moment, { Moment } from 'moment';
import * as React from 'react';
import { UserOption } from '../../../src/settings'
import { innerDateFormat, TaskDataModel, TaskMapable, TaskStatus } from '../../../utils/tasks';
import { TaskListContext, TodayFocusEventHandlersContext, UserOptionContext } from './context';
import { YearView } from './yearview';


const defaultTimelineProps = {
    userOptions: {} as UserOption,
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
            filter: this.props.userOptions.defaultFilters,
            todayFocus: this.props.userOptions.defaultTodayFocus,
        }
    }

    handleCounterFilterClick(filterName: string) {
        if (this.state.filter !== filterName) {
            this.setState({
                filter: filterName,
            })
        } else {
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

        return (
            <TaskListContext.Consumer>{({ taskList }) => {
                const involvedDates: Set<string> = new Set();

                taskList.forEach((t: TaskDataModel) => {
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
                const years = Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => i + earliestYear);

                const todoCount: number = taskList.filter(t => !t.completed &&
                    t.status !== TaskStatus.overdue && t.status !== TaskStatus.unplanned &&
                    t.status !== TaskStatus.done && t.status !== TaskStatus.cancelled).length;
                const overdueCount: number = taskList.filter(t => t.status === TaskStatus.overdue).length;
                const unplannedCount: number = taskList.filter(t => t.status === TaskStatus.unplanned).length;

                const styles = new Array<string>;
                if (!this.props.userOptions.useCounters) styles.push("noCounters");
                if (!this.props.userOptions.useQuickEntry) styles.push("noQuickEntry");
                if (!this.props.userOptions.useYearHeader) styles.push("noYear");
                if (!this.props.userOptions.useCompletedTasks) styles.push("noDone");
                if (!this.props.userOptions.useInfo.useFileBadge &&
                    !this.props.userOptions.useInfo.usePriority &&
                    !this.props.userOptions.useInfo.useRecurrence &&
                    !this.props.userOptions.useInfo.useRelative &&
                    !this.props.userOptions.useInfo.useSection &&
                    !this.props.userOptions.useInfo.useTags) styles.push("noInfo");
                else {
                    if (!this.props.userOptions.useInfo.useFileBadge) styles.push("noFile");
                    if (!this.props.userOptions.useInfo.usePriority) styles.push("noPriority");
                    if (!this.props.userOptions.useInfo.useRecurrence) styles.push("noRepeat");
                    if (!this.props.userOptions.useInfo.useRelative) styles.push("noRelative");
                    if (!this.props.userOptions.useInfo.useSection) styles.push("noHeader");
                    if (!this.props.userOptions.useInfo.useTags) styles.push("noTag");
                }

                return (
                    <div className={`taskido ${styles} ${this.state.filter} ${this.state.todayFocus ? "todayFocus" : ""}`} id={`taskido${(new Date()).getTime()}`}>
                        <TodayFocusEventHandlersContext.Provider value={{ handleTodayFocusClick: this.handleTodayFocus }}>
                            <UserOptionContext.Provider value={{
                                hideTags: this.props.userOptions.hideTags,
                                tagPalette: this.props.userOptions.tagColorPalette,
                                dateFormat: "DD mm yyyy",
                                taskFiles: this.props.userOptions.taskFiles,
                                select: this.props.userOptions.inbox,
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
                                    {years.map((y, i) => (
                                        <TaskListContext.Provider value={
                                            { taskList: taskList.filter(TaskMapable.filterYear(moment().year(y))) }
                                        } key={i}>
                                            <YearView year={y} key={y} />
                                        </TaskListContext.Provider>
                                    ))}
                                </span>
                            </UserOptionContext.Provider>
                        </TodayFocusEventHandlersContext.Provider>
                    </div>)
            }}
            </TaskListContext.Consumer>
        );
    }
}