import './ui/view.css'
import * as icons from './ui/icons'
import {
    doneDateSymbol, dueDateSymbol, innerDateFormat, prioritySymbols,
    recurrenceSymbol, scheduledDateSymbol, startDateSymbol, TaskDataModel,
    TaskRegularExpressions, TaskStatus
} from './tasks'
import { Options } from './options'
import { TaskMapable } from "./tasks";
import moment, { Moment } from 'moment'
import * as React from "react";
import ReactDOM from 'react-dom/client'
import { getFileTitle } from '../../dataview-util/dataview';
import ReactDOMServer from 'react-dom/server';

const DEFAULT_OPTIONS: Options = {
    inbox: undefined,
    select: undefined,
    taskOrder: ["overdue", "due", "scheduled", "start", "process", "unplanned", "done", "cancelled"],
    taskFiles: [],
    globalTaskFilter: [],
    dailyNoteFolder: "",
    dailyNoteFormat: "YYYY-MM-DD",
    done: false,
    sort: (t1: TaskDataModel, t2: TaskDataModel) => { return t1.order - t2.order; },
    css: undefined,
    forward: false,
    dateFormat: "ddd, MMM D",
    options: [],
}

export class View {
    private options: Options;
    private tasks: TaskDataModel[] = [];
    //private timelineDates: string[] = [];
    private tid: number = (new Date()).getTime();
    private today: string = moment().format("YYYY-MM-DD");
    private orderMap: Map<string, number> = new Map();
    private calendar: Map<string, Set<number>> = new Map();
    private rootNode: ReactDOM.Root;
    private reactKey: number = 0;
    constructor(
        container: HTMLElement,
        tasks: TaskDataModel[],
        options: Options | undefined,
    ) {
        this.rootNode = ReactDOM.createRoot(container);

        this.options = options ? options : DEFAULT_OPTIONS;
        if (this.options.dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g)?.length !== this.options.dailyNoteFormat.length) {
            // Error handler here
            return;
        }

        this.options.taskOrder.forEach((value: string, index: number) => {
            this.orderMap.set(value, index);
        });

        this.tasks = tasks
            .map(TaskMapable.tasksPluginTaskParser)
            .map(TaskMapable.dataviewTaskParser)
            .map(TaskMapable.dailyNoteTaskParser())
            .map(TaskMapable.taskLinkParser)
            .map(TaskMapable.remainderParser)
            .map(TaskMapable.postProcessor)
            .map((t) => {
                t.order = this.orderMap.get(t.status) || 0;
                return t;
            });

        const insertCalendar = (m: Moment | undefined, index: number) => {
            if (!m) return;
            const key = m.format(innerDateFormat);
            if (!this.calendar.has(key)) this.calendar.set(key, new Set());
            const set = this.calendar.get(key)?.add(index);
            if (!!set)
                this.calendar.set(key, set);
        }

        this.tasks.forEach((t: TaskDataModel, index: number) => {
            if (t.status === TaskStatus.unplanned) {
                if (t.created) insertCalendar(t.created, index);
                //insertCalendar(moment(), index);
            }
            insertCalendar(t.due, index);
            insertCalendar(t.scheduled, index);
            insertCalendar(t.created, index);
            insertCalendar(t.start, index);
            insertCalendar(t.completion, index);
            t.dates.forEach((d: Moment, k: string) => {
                insertCalendar(d, index);
            });
        })

        this.calendar = new Map([...this.calendar.entries()].sort((a, b) => {
            return a[0] < b[0] ? 1 : 0;
        }));
    }

    taskTagFilter(index: number) {
        this.options.globalTaskFilter.forEach(element => {
            this.tasks[index].text = this.tasks[index].text.replace(element, "");
        });
        return true;
    }

    _renderYearHead(year: string, dataTypes: Array<string>) {
        return (
            <div className={moment().format("YYYY") === year ? "year current" : "year"} data-types={dataTypes.join(" ")} key={this.reactKey++}>
                {year}
            </div>);
    }

    _renderTodayComponent(todoCnt: number, overdueCnt: number, unplannedCnt: number) {
        const currentDailyNote = this.options.dailyNoteFolder + moment().format(this.options.dailyNoteFormat) + ".md";
        this.options.taskFiles.push(currentDailyNote);
        if (!!(this.options.inbox)) this.options.taskFiles.push(this.options.inbox);
        this.options.taskFiles = [...new Set(this.options.taskFiles)].sort();

        return (
            <div>
                <div className='todayHeader' aria-label='Focus today' onClick={this.todayFocusEvent()}>
                    Today
                </div>
                <div className='counters'>
                    <div className='counter' id='todo' aria-label="Filter tasks to do" onClick={this.filterCounterEvent("todo")}>
                        <div className='count'>{todoCnt}</div>
                        <div className='label'>To Do</div>
                    </div>
                    <div className='counter' id='overdue' aria-label="Filter overdue tasks" onClick={this.filterCounterEvent("overdue")}>
                        <div className='count'>{overdueCnt}</div>
                        <div className='label'>Overdue</div>
                    </div>
                    <div className='counter' id='unplanned' aria-label="Filter unplanned tasks" onClick={this.filterCounterEvent("unplanned")}>
                        <div className='count'>{unplannedCnt}</div>
                        <div className='label'>Unplanned</div>
                    </div>
                </div>
                <div className='quickEntryPanel'>
                    <div className='left'>
                        <select className='fileSelect' aria-label='Select a note to add a new task to'
                            onChange={this.quickEntryFileSelectChangeEvent()} value={this.options.select}>
                            {this.options.taskFiles.map(f => {
                                const secondParentFolder =
                                    f.split("/")[f.split("/").length - 3] == null ? "" : "… / ";
                                const parentFolder =
                                    f.split("/")[f.split("/").length - 2] == null ? "" :
                                        secondParentFolder + "📂&nbsp;" + f.split("/")[f.split("/").length - 2] + " / ";
                                const filePath = parentFolder + "📄&nbsp;" + getFileTitle(f);
                                const select: boolean = this.options.select !== undefined &&
                                    (this.options.select === f || (this.options.select === "dailyNote" && f === currentDailyNote));

                                return (
                                    <option value={f} title={f} key={this.reactKey++}>
                                        {filePath}
                                    </option>);
                            })}
                        </select>
                        <input className='newTask' type='text' placeholder='Enter your tasks here'
                            onInput={this.quickEntryNewTaskInputEvent()} onKeyUp={this.quickEntryNewTaskKeyUpEvent()}
                            onFocus={this.quickEntryNewTaskFocusEvent()} onBlur={this.quickEntryNewTaskBlurEvent()} />
                    </div>
                    <div className='right'>
                        <button className='ok' aria-label='Append new task to selected note' onClick={this.quickNewTaskEnteredEvent()}>
                            {icons.buttonIcon}
                        </button>
                    </div>
                </div>
            </div>);
    }

    _renderTaskItem(task: TaskDataModel) {

        const getMetaFromNote = (item: TaskDataModel, metaName: string) => {
            const meta = item.fontMatter[metaName as keyof typeof item.fontMatter];
            if (!!meta) return meta[0];
            return "";
        }

        const getRelative = (someDate: Moment) => {
            if (moment().diff(someDate, 'days') >= 1 || moment().diff(someDate, 'days') <= -1) {
                return someDate.fromNow();
            } else {
                return someDate.calendar().split(' ')[0];
            };
        };

        const taskInfoElemWithIconAndLabel =
            (icon: JSX.Element, label: string, aria_label: string, rootClasses: string, clickEvt: React.MouseEventHandler) => {
                return (
                <div className={rootClasses} aria-label={aria_label} onClick={clickEvt} key={this.reactKey++}>
                    <div className='icon'>
                        {icon}
                    </div>
                    <div className='label'>
                        {label}
                    </div>
                </div>);
            };

        var infoElems: Array<React.ReactElement> = [];

        const link = task.link.path.replace("'", "&apos;");
        const line = task.position.start.line;
        const col = task.position.end.col;
        // Handle forwarded tasks to get relative by cls
        const getStatusLabelElem = (date: Moment, status: string) => {
            const statusDate = date.format(innerDateFormat);
            const relative = getRelative(date);
            const aria_label = status + ": " + statusDate;
            return taskInfoElemWithIconAndLabel(icons.iconMap[status + "Icon" as icons.IconType], relative,
                aria_label, "relative", this.openTaskFileEvent(link, line, col));

        }

        if (task.due) {
            infoElems.push(getStatusLabelElem(task.due, task.status));
        }

        if (task.created) {
            infoElems.push(getStatusLabelElem(task.created, task.status));
        }

        if (task.start) {
            infoElems.push(getStatusLabelElem(task.start, task.status));
        }

        if (task.scheduled) {
            infoElems.push(getStatusLabelElem(task.scheduled, task.status));
        }

        if (task.completion) {
            infoElems.push(getStatusLabelElem(task.completion, task.status));
        }

        if (task.recurrence) {
            const infoElem =
                taskInfoElemWithIconAndLabel(icons.repeatIcon, task.recurrence.replace(recurrenceSymbol, ""), '', 'repeat',
                    this.openTaskFileEvent(link, line, col));
            infoElems.push(infoElem);
        };

        if (task.priorityLabel) {
            const infoElem =
                taskInfoElemWithIconAndLabel(icons.priorityIcon, task.priorityLabel, '', 'priority',
                    this.openTaskFileEvent(link, line, col));
            infoElems.push(infoElem);
        }

        const fileName = getFileTitle(task.path);

        const infoElem = (//taskInfoElemWithIconAndLabel(icons.fileIcon, file, )
            <div className='file' aria-label={task.path} key={this.reactKey++}>
                <div className='icon'>{icons.fileIcon}</div>
                <div className='label'>{fileName}</div>
                <span className='header'>{task.section.subpath}</span>
            </div>);
        infoElems.push(infoElem);

        var text = task.text;

        task.tags.forEach((tag) => {
            var tagText = tag.replace("#", "");
            const hexColorMatch = tag.match(TaskRegularExpressions.hexColorRegex);
            var style: string;
            if (hexColorMatch) {
                style = "style='--tag-color:#" + hexColorMatch[1] + ";--tag-background:#" + hexColorMatch[1] + "1a'";
                tagText = hexColorMatch[2];
            } else {
                style = "style='--tag-color:var(--text-muted)'";
            };

            const tagElem = (
                <a href={tag} className={'tag ' + style} aria-label={'#' + tagText} onClick={this.clickTagsEvent(tagText)} key={this.reactKey++}>
                    <div className='icon'>{icons.tagIcon}</div>
                    <div className='label'>{tagText}</div>
                </a>);
            infoElems.push(tagElem);
            text = text.replace(tag, "");
        });

        const taskStatusIcon = icons.getTaskStatusIcon(task.status);

        const color = getMetaFromNote(task, "color");
        const colorClass = color === "" ? "var(--text-muted)" : color;

        return (
            <div data-line={line} data-col={col} key={this.reactKey++}
                data-link={link} data-dailynote={task.dailyNote} className={'task ' + task.status}
                style={{"--task-color": colorClass} as React.CSSProperties} aria-label={fileName}>
                <div className='timeline' onClick={this.taskCompleteEvent(link, line, col)}>
                    <div className='icon'>{taskStatusIcon}</div>
                    <div className='stripe'></div>
                </div>
                <div className='lines'>
                    <a className='internal-link' href={link}>
                        <div className='content'>{text}</div>
                    </a>
                    <div className='line info'>
                        {infoElems.map(e => e)}
                    </div>
                </div>
            </div>);
    }

    renderDay(thisDay: string, tasksOfThisDay: Array<TaskDataModel>) {
        let taskNodesPerDay: Array<any> = [];
        let taskStatusPerDay: Set<string> = new Set();
        tasksOfThisDay.forEach(t => {
            taskStatusPerDay.add(t.status);
            const taskNode = this._renderTaskItem(t);
            taskNodesPerDay.push(taskNode);
        });
        const thisYear = moment(thisDay).format("YYYY");
        if (thisDay !== this.today) {
            return (
                <div className='details' data-year={thisYear} data-types={Array.from(taskStatusPerDay).join(" ")} key={this.reactKey++}>
                    <div className='dateLine' key={this.reactKey++}>
                        <div className='date' key={this.reactKey++}>{thisDay}</div>
                        <div className='weekday' key={this.reactKey++}></div>
                    </div>
                    <div className='content' key={this.reactKey++}>
                        {taskNodesPerDay.map(n => n)}
                    </div>
                </div>);
        }
        const overdueCount: number = this.tasks.filter(t => t.status === TaskStatus.overdue).length;
        const dueCount: number = tasksOfThisDay.filter(t => t.status === TaskStatus.due).length;
        const startCount: number = tasksOfThisDay.filter(t => t.status === TaskStatus.start).length;
        const scheduledCount: number = tasksOfThisDay.filter(t => t.status === TaskStatus.scheduled).length;
        const doneCount: number = tasksOfThisDay.filter(t => t.status === TaskStatus.done).length;
        const dailynoteCount: number = tasksOfThisDay.filter(t => t.dailyNote).length;
        const processCount: number = tasksOfThisDay.filter(t => t.status === TaskStatus.process).length;
        const todoCount: number = tasksOfThisDay.filter(t => !t.completed &&
            t.status !== TaskStatus.overdue && t.status !== TaskStatus.unplanned).length;
        const unplannedCount: number = this.tasks.filter(t => t.status === TaskStatus.unplanned).length;
        const allCount: number = doneCount + todoCount + overdueCount;
        return (
            <div className={'details today'} data-year={thisYear} data-types={Array.from(taskStatusPerDay).join(" ")} key={this.reactKey++}>
                <div className='dateLine'>
                    <div className='date'>{thisDay}</div>
                    <div className='weekday'></div>
                </div>
                <div className='content'>
                    {this._renderTodayComponent(todoCount, overdueCount, unplannedCount)}
                    {taskNodesPerDay.map(n => n)}
                </div>
            </div>);
    }

    renderYear(thisYear: string, tasksOfThisYear: TaskDataModel[], datesOfThisYear: string[]) {
        tasksOfThisYear = tasksOfThisYear.sort(this.options.sort);

        if (tasksOfThisYear.length === 0 || datesOfThisYear.length === 0) return undefined;

        var taskStatusPerYear: Set<string> = new Set();
        var dateNodesOfThisYear: Array<any> = [];
        for (var i = 0; i < datesOfThisYear.length; ++i) {

            const thisDate = datesOfThisYear[i].toString();

            const tasksOfThisDate = tasksOfThisYear.filter(TaskMapable.filterDate(moment(thisDate)));

            tasksOfThisDate.forEach(t => taskStatusPerYear.add(t.status))

            const dateNode = this.renderDay(thisDate, tasksOfThisDate);
            dateNodesOfThisYear.push(dateNode);
        }

        return (
            <div key={this.reactKey++}>
                {this._renderYearHead(thisYear, Array.from(taskStatusPerYear))}
                {dateNodesOfThisYear.map(n => n)}
            </div>);
    }

    render() {
        //this.timelineDates.push(moment().format("YYYY-MM-DD"));

        if (!this.calendar.has(moment().format(innerDateFormat)))
            this.calendar.set(moment().format(innerDateFormat), new Set());

        const sortedDatas = [...this.calendar.keys()].sort();

        const earliestYear: number = +moment(sortedDatas[0].toString()).format("YYYY");
        const latestYear: number = +moment(sortedDatas[sortedDatas.length - 1].toString()).format("YYYY");

        var yearNodes: Array<any> = [];
        for (let year = earliestYear; year < latestYear + 1; ++year) {
            const datesOfThisYear = sortedDatas.filter(d => {
                return moment(d).year() === year;
            });

            const tasksOfThisYear: TaskDataModel[] = [];
            datesOfThisYear.forEach(d => {
                this.calendar.get(d)?.forEach(index => {
                    tasksOfThisYear.push(this.tasks[index]);
                })
            })

            const yearNode = this.renderYear(`${year}`, tasksOfThisYear, datesOfThisYear);
            if (!yearNode) continue;
            yearNodes.push(yearNode);
        }

        const styles: string = this.options.options.join(" ");
        const timelineNode = (
            <div className={`taskido ${styles}`} id={`taskido ${this.tid}`}>
                <span>
                    {yearNodes.map(n => n)}
                </span>
            </div>);
        this.rootNode.render(timelineNode);
    }

    onCompleteTask(link: string, line: number, col: number) {

    }

    onOpenTaskFile(link: string, line: number, col: number) {

    }

    onCreateNewTaskEntry(filePath: string, content: string) {

    }

    filterCounterEvent(filterID: string) {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            const activeFocus = Array.from(timelineRoot.classList).filter(c => c.endsWith("Filter") && !c.startsWith("today"));
            if (activeFocus.includes(filterID + "Filter")) {
                timelineRoot.classList.remove(filterID + "Filter");
                return false;
            };
            timelineRoot.classList.remove.apply(timelineRoot.classList,
                Array.from(timelineRoot.classList).filter(c => c.endsWith("Filter") && !c.startsWith("today")));
            timelineRoot.classList.add(filterID + "Filter");
        }
    }

    todayFocusEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            timelineRoot.classList.toggle("todayFocus");
        }
    }

    taskCompleteEvent(link: string, line: number, col: number) {
        return (e: React.MouseEvent) => {
            if (!e.target) return;
            const task = (e.target as HTMLElement).closest(".task");
            if (task)
                task.className = "task done";
            const icon = (e.target as HTMLElement).closest(".timeline .icon");
            if(!!icon)
                icon.innerHTML = ReactDOMServer.renderToString(icons.doneIcon);
            this.onCompleteTask(link, line, col);
        }
    }

    openTaskFileEvent(link: string, line: number, col: number) {
        return () => {
            this.onOpenTaskFile(link, line, col);
        }
    }

    clickTagsEvent(tag: string) {
        return () => {
            // do something with the tag
        }
    }

    quickNewTaskEnteredEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            const filePath = (timelineRoot.querySelector('.fileSelect') as HTMLSelectElement).value;
            const newTask = (timelineRoot.querySelector('.newTask') as HTMLInputElement).value;
            if (newTask.length > 1) {
                this.onCreateNewTaskEntry(filePath, newTask);
            } else {
                (timelineRoot.querySelector('.newTask') as HTMLInputElement).focus();
            };
        }
    }

    quickEntryFileSelectChangeEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            (timelineRoot.querySelector('.newTask') as HTMLInputElement).focus();
        }
    }

    quickEntryNewTaskInputEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            const input = timelineRoot.querySelector('.newTask') as HTMLInputElement;
            const newTask: string = input.value;

            // Icons
            if (newTask.includes("due ")) { input.value = newTask.replace("due", dueDateSymbol) };
            if (newTask.includes("start ")) { input.value = newTask.replace("start", startDateSymbol) };
            if (newTask.includes("scheduled ")) { input.value = newTask.replace("scheduled", scheduledDateSymbol) };
            if (newTask.includes("done ")) { input.value = newTask.replace("done", doneDateSymbol) };
            if (newTask.includes("high ")) { input.value = newTask.replace("high", prioritySymbols.High) };
            if (newTask.includes("medium ")) { input.value = newTask.replace("medium", prioritySymbols.Medium) };
            if (newTask.includes("low ")) { input.value = newTask.replace("low", prioritySymbols.Low) };
            if (newTask.includes("repeat ")) { input.value = newTask.replace("repeat", recurrenceSymbol) };
            if (newTask.includes("recurring ")) { input.value = newTask.replace("recurring", recurrenceSymbol) };

            // Dates
            if (newTask.includes("today ")) { input.value = newTask.replace("today", moment().format("YYYY-MM-DD")) };
            if (newTask.includes("tomorrow ")) { input.value = newTask.replace("tomorrow", moment().add(1, "days").format("YYYY-MM-DD")) };
            if (newTask.includes("yesterday ")) { input.value = newTask.replace("yesterday", moment().subtract(1, "days").format("YYYY-MM-DD")) };

            // In X days/weeks/month/years
            const futureDate = newTask.match(/(in)\W(\d{1,3})\W(days|day|weeks|week|month|years|year) /);
            if (futureDate) {
                const value: number = parseInt(futureDate[2]);
                const unit = futureDate[3] as moment.unitOfTime.Base;
                const date = moment().add(value, unit).format("YYYY-MM-DD[ ]")
                input.value = newTask.replace(futureDate[0], date);
            };

            // Next Weekday
            const weekday = newTask.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday) /);
            if (weekday) {
                const weekdays = ["", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                const dayINeed = weekdays.indexOf(weekday[1]);
                if (moment().isoWeekday() < dayINeed) {
                    input.value = newTask.replace(weekday[1], moment().isoWeekday(dayINeed).format("YYYY-MM-DD"));
                } else {
                    input.value = newTask.replace(weekday[1], moment().add(1, 'weeks').isoWeekday(dayINeed).format("YYYY-MM-DD"));
                };
            };

            (timelineRoot.querySelector('.newTask') as HTMLInputElement).focus();
        }
    }

    quickEntryNewTaskKeyUpEvent() {
        return (e: React.KeyboardEvent) => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            if (e.key === "Enter") { // Enter key
                (timelineRoot.querySelector('.ok') as HTMLButtonElement).click();
            };
        }
    }

    quickEntryNewTaskFocusEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            (timelineRoot.querySelector('.quickEntryPanel') as HTMLDivElement).classList.add("focus");
        }
    }

    quickEntryNewTaskBlurEvent() {
        return () => {
            const timelineRoot = document.getElementById(`taskido ${this.tid}`);
            if (!timelineRoot) return;
            (timelineRoot.querySelector('.quickEntryPanel') as HTMLDivElement).classList.remove("focus");
        }
    }
}