import * as React from 'react'
import { CounterProps } from './dateview';

export const UserOptionContext = React.createContext({
    taskFiles: [] as string[],
    select: undefined as string | undefined,
    counters: [] as CounterProps[],
});

export const CreateNewTaskContext = React.createContext({
    handleCreateNewTask: (filePath: string, content: string) => { },
});

export const TodayFocusEventHandlers = React.createContext({
    handleTodayFocusClick: () => { },
})

export const TaskItemEventHandlers = React.createContext({
    handleTagClick: (tag: string) => { },
    handleOpenFile: (filePath: string, startOffset: number, endOffset: number) => { },
    handleCompleteTask: (filePath: string, startOffset: number, endOffset: number) => { },
})