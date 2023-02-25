import { Pos } from 'obsidian';
import * as React from 'react'
import { TaskDataModel } from '../utils/tasks';
import { CounterProps } from './dateview';

export const TaskListContext = React.createContext({
    taskList: [] as TaskDataModel[],
})

export const UserOptionContext = React.createContext({
    taskFiles: new Set<string>(),
    select: "" as string,
    counters: [] as CounterProps[],
});

export const CreateNewTaskContext = React.createContext({
    handleCreateNewTask: (filePath: string, content: string) => { },
});

export const TodayFocusEventHandlersContext = React.createContext({
    handleTodayFocusClick: () => { },
})

export const TaskItemEventHandlersContext = React.createContext({
    handleOpenFile: (filePath: string, position: Pos) => { },
    handleCompleteTask: (filePath: string, position: Pos) => { },
    handleTagClick: (tag: string) => {},
})