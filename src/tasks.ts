import type { Moment } from 'moment';
import { Link, STask } from '../../dataview-util/markdown';
import { getFileTitle } from '../../dataview-util/dataview';
import { FileView, Pos, Tasks } from 'obsidian'
import moment from 'moment';
import { momentToRegex } from './utils/utils';
import { DateTime } from 'luxon';

/**
 * When sorting, make sure low always comes after none. This way any tasks with low will be below any exiting
 * tasks that have no priority which would be the default.
 *
 * @export
 * @enum {number}
 */
export enum Priority {
    High = '1',
    Medium = '2',
    None = '3',
    Low = '4',
}

export const prioritySymbols = {
    High: '⏫',
    Medium: '🔼',
    Low: '🔽',
    None: '',
};

export const recurrenceSymbol = '🔁';
export const startDateSymbol = '🛫';
export const scheduledDateSymbol = '⏳';
export const dueDateSymbol = '📅';
export const doneDateSymbol = '✅';

export const innerDateFormat = "YYYY-MM-DD";

//["overdue", "due", "scheduled", "start", "process", "unplanned","done","cancelled"]
export type TaskStatusType =
    | "due"
    | "overdue"
    | "scheduled"
    | "start"
    | "done"
    | "unplanned"
    | "process"
    | "cancelled"

export const enum TaskStatus {
    due = 'due',
    scheduled = 'scheduled',
    start = 'start',
    done = 'done',
    unplanned = 'unplanned',
    overdue = 'overdue',
    process = 'process',
    cancelled = 'cancelled',
}

const TaskStatusCollection: string[] = [TaskStatus.due, TaskStatus.scheduled, TaskStatus.start, TaskStatus.done, TaskStatus.unplanned];

export class TaskRegularExpressions {
    public static readonly dateFormat = 'YYYY-MM-DD';

    // Matches indentation before a list marker (including > for potentially nested blockquotes or Obsidian callouts)
    public static readonly indentationRegex = /^([\s\t>]*)/;

    // Matches - or * list markers, or numbered list markers (eg 1.)
    public static readonly listMarkerRegex = /([-*]|[0-9]+\.)/;

    // Matches a checkbox and saves the status character inside
    public static readonly checkboxRegex = /\[(.)\]/u;

    // Matches the rest of the task after the checkbox.
    public static readonly afterCheckboxRegex = / *(.*)/u;

    // Main regex for parsing a line. It matches the following:
    // - Indentation
    // - List marker
    // - Status character
    // - Rest of task after checkbox markdown
    public static readonly taskRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source +
        TaskRegularExpressions.listMarkerRegex.source +
        ' +' +
        TaskRegularExpressions.checkboxRegex.source +
        TaskRegularExpressions.afterCheckboxRegex.source,
        'u',
    );

    // Used with the "Create or Edit Task" command to parse indentation and status if present
    public static readonly nonTaskRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source +
        TaskRegularExpressions.listMarkerRegex.source +
        '? *(' +
        TaskRegularExpressions.checkboxRegex.source +
        ')?' +
        TaskRegularExpressions.afterCheckboxRegex.source,
        'u',
    );

    // Used with "Toggle Done" command to detect a list item that can get a checkbox added to it.
    public static readonly listItemRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source + TaskRegularExpressions.listMarkerRegex.source,
    );

    // Match on block link at end.
    public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+/u;

    // The following regex's end with `$` because they will be matched and
    // removed from the end until none are left.
    public static readonly priorityRegex = /([⏫🔼🔽])$/u;
    public static readonly startDateRegex = /🛫 *(\d{4}-\d{2}-\d{2})/u;
    public static readonly scheduledDateRegex = /[⏳⌛] *(\d{4}-\d{2}-\d{2})/u;
    public static readonly dueDateRegex = /[📅📆🗓] *(\d{4}-\d{2}-\d{2})/u;
    public static readonly doneDateRegex = /✅ *(\d{4}-\d{2}-\d{2})/u;
    public static readonly recurrenceRegex = /🔁 ?([a-zA-Z0-9, !]+)/iu;

    // regex from @702573N
    public static readonly hexColorRegex = /([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\/(.*)/;
    public static readonly TasksPluginDateRegex = /[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/;

    // [[a::b]] => a, b
    public static readonly keyValueRegex = /\[+([^\]]+)\:\:([^\]]+)\]/g;

    // [a](b) => a, b (a could be empty)
    public static readonly outerLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

    public static readonly innerLinkRegex = /\[\[([^\]]+)\]\]/g;
    public static readonly highlightRegex = /\=\=([^\]]+)\=\=/g;
    public static readonly remainderRegex =
        /⏰ *(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})|⏰ *(\d{4}-\d{2}-\d{2})|(\(\@(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})\))|(\(\@(\d{4}-\d{2}-\d{2})\))/;
    // Regex to match all hash tags, basically hash followed by anything but the characters in the negation.
    // To ensure URLs are not caught it is looking of beginning of string tag and any
    // tag that has a space in front of it. Any # that has a character in front
    // of it will be ignored.
    // EXAMPLE:
    // description: '#dog #car http://www/ddd#ere #house'
    // matches: #dog, #car, #house
    public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]*/g;
    public static readonly hashTagsFromEnd = new RegExp(this.hashTags.source + '$');
}

/**
 * Task encapsulates the properties of the MarkDown task along with
 * the extensions provided by this plugin. This is used to parse and
 * generate the markdown task for all updates and replacements.
 *
 * @export
 * @class Task
 */

const defaultSort = (t1: TaskDataModel, t2: TaskDataModel) => { return t1.order - t2.order; };
export interface TaskDataModel extends STask {
    // 
    dailyNote: boolean,
    //
    order: number,
    //
    priority: Priority,
    //
    priorityLabel: string,
    //
    //happens: Map<string, string>,
    //
    recurrence: string,
    //
    fontMatter: Record<string, string>,
    //
    isTasksTask: boolean,
    dates: Map<string, Moment>;
};

export namespace TaskMapable {

    export function filterDate(date: Moment){
        return filterByDateTime(date, "date");
    }

    export function filterYear(date: Moment){
        return filterByDateTime(date, "year");
    }

    function filterByDateTime(date: Moment, by: moment.unitOfTime.StartOf){
        return (item: TaskDataModel) => {
            if(item.due)return date.isSame(item.due, by);
            if(item.scheduled)return date.isSame(item.scheduled, by);
            if(item.created)return date.isSame(item.created, by);
            if(item.completion)return date.isSame(item.completion, by);
            if(item.start)return date.isSame(item.start, by);
            return false;
        }
    }

    export function tasksPluginTaskParser(item: TaskDataModel) {
        return item;
    }

    export function dataviewTaskParser(item: TaskDataModel) {
        var inlineFields = TaskRegularExpressions.keyValueRegex.exec(item.text);
        while (!!inlineFields) {
            const inlineField: string = inlineFields[0];
            const fieldKey = inlineFields[1].toLowerCase();
            const fieldValue: string = inlineFields[2];
            item.text = item.text.replace(inlineField, "");
            inlineFields = TaskRegularExpressions.keyValueRegex.exec(item.text);

            if (!(TaskStatusCollection.includes(fieldKey))) continue;
            const fieldDateMoment: moment.Moment = moment(fieldValue);
            if (!fieldDateMoment.isValid()) continue;
            //
            switch (fieldKey) {
                case "due":
                    item.due = fieldDateMoment; break;
                case "scheduled":
                    item.scheduled = fieldDateMoment; break;
                case "complete":
                case "completion":
                case "done":
                    item.completion = fieldDateMoment; break;
                case "created":
                    item.created = fieldDateMoment; break;
                case "start":
                    item.start = fieldDateMoment; break;
                default:
                    item.dates.set(fieldKey, fieldDateMoment);
            }
        }
        return item;
    }

    export function dailyNoteTaskParser(dailyNoteFormat: string = innerDateFormat) {
        return (item: TaskDataModel) => {
            const taskFile: string = getFileTitle(item.path);
            const dailyNoteRegEx = momentToRegex(dailyNoteFormat)
            const dailyNoteMatch = taskFile.match(dailyNoteRegEx);

            item.dailyNote = !!dailyNoteMatch;
            if (!item.dailyNote) return item;

            const dailyNoteDate = moment(dailyNoteMatch![1], dailyNoteFormat);
            if (!item.start) item.start = dailyNoteDate;
            if (!item.scheduled) item.scheduled = dailyNoteDate;
            if (!item.created) item.created = dailyNoteDate;

            return item;
        }
    }

    export function taskLinkParser(item: TaskDataModel) {
        var outerLinkMatch = TaskRegularExpressions.outerLinkRegex.exec(item.text);

        const buildLink = (text: string, display: string, path: string) => {
            item.text = item.text.replace(text, "");
            outerLinkMatch = TaskRegularExpressions.outerLinkRegex.exec(item.text);

            if (item.outlinks.some(l => l.path === path)) return;

            const link = Link.file(path, false, display);
            item.outlinks.push(link);
        };

        while (!!outerLinkMatch) {
            buildLink(outerLinkMatch[0], outerLinkMatch[1], outerLinkMatch[2]);
            outerLinkMatch = TaskRegularExpressions.outerLinkRegex.exec(item.text);
        }

        var innerLinkMatch = TaskRegularExpressions.innerLinkRegex.exec(item.text);
        var dataviewDateMatch = TaskRegularExpressions.keyValueRegex.exec(item.text);
        while (!!innerLinkMatch && !dataviewDateMatch) {
            buildLink(innerLinkMatch[0], innerLinkMatch[1], innerLinkMatch[2]);
            innerLinkMatch = TaskRegularExpressions.innerLinkRegex.exec(item.text);
            dataviewDateMatch = TaskRegularExpressions.keyValueRegex.exec(item.text);
        }

        return item;
    }

    export function remainderParser(item: TaskDataModel) {
        var match = item.text.match(TaskRegularExpressions.remainderRegex);
        if (!match) return item;
        item.text = item.text.replace(match[0], "");
        return item;
    }

    export function postProcessor(item: TaskDataModel) {
        //["overdue", "due", "scheduled", "start", "process", "unplanned","done","cancelled"]

        //create ------------ scheduled ------- start --------- due --------- (done)
        //        scheduled              start         process       overdue
        if (!item.due && !item.scheduled &&
            !item.start && !item.completion && item.dates.size === 0) {
            item.status = TaskStatus.unplanned;
            if(item.completed)item.status = TaskStatus.done;
            return item;
        }

        if (item.completed && (item.scheduled && item.scheduled.isAfter() ||
            item.start && item.start.isAfter())) {
            item.status = TaskStatus.cancelled;
            return item;
        }

        if (item.completed) {
            item.status = TaskStatus.done;
            return item;
        }

        if (item.due && item.due.isBefore()) {
            item.status = TaskStatus.overdue;
            return item;
        }

        if (item.due && item.due.isSame()) {
            item.status = TaskStatus.due;
            return item;
        }

        if (item.start && item.start.isBefore()) {
            item.status = TaskStatus.process;
            return item;
        }

        if (item.scheduled && item.scheduled.isBefore()) {
            item.status = TaskStatus.start;
            return item;
        }

        item.status = TaskStatus.scheduled;
        return item;
    }
}
