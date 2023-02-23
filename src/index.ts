import * as input from '../_input'
import { Options } from './options'
import { TaskDataModel } from './tasks'
import { View } from './view'

const option : Options = {
    inbox: undefined,
    select: undefined,
    taskOrder: ["overdue", "due", "scheduled", "start", "process", "unplanned","done","cancelled"],
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

const view = new View(
    input.rootNode, input.pages, option
)

input.rootNode.appendChild(view.render())