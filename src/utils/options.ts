import moment from "moment";
import { TaskDataModel } from "./tasks";

export interface Options {
    inbox: string | undefined,
    select: string | undefined,
    taskOrder: Array<string>,
    taskFiles: Array<string>,
    globalTaskFilter: Array<string>,
    dailyNoteFolder: string,
    dailyNoteFormat: string,
    done: boolean,
    sort: (t1: TaskDataModel, t2: TaskDataModel) => number,
    css: string | undefined,
    forward: boolean,
    dateFormat: string,
    options: Array<string>,
}