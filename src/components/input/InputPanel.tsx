import React, { useMemo, useState } from "react";
import { Input } from "@nextui-org/react";
import TrivialSingleSelect from './TrivialSingleSelect';
import { iconMap } from "../asserts/icons";
import DatePickerListPopover, { TaskItemDateInfo } from "./DatePickerListPopover";
import { TaskDataModel } from "utils/tasks";

function TaskCreateTargetLabel({
    targetLabel
}: {
    targetLabel: string
}) {
    return (
        <>
            {"create in: " + targetLabel}
        </>
    );
}

function InputPanel({
    newItemDestinationOptions,
    priorityOptions,
    onCreateNewItem,
}: {
    newItemDestinationOptions: string[],
    priorityOptions?: string[],
    onCreateNewItem?: (item: TaskDataModel) => void,
}) {

    const [selectedTarget, setSelectedTarget] = useState(new Set([""]));
    const taskTargetLabel = useMemo(
        () => Array.from(selectedTarget)[0],
        [selectedTarget]
    );

    priorityOptions = priorityOptions || ["No", "Low", "Mid", "High"];
    const [selectedPriority, setSelectedPriority] = useState(new Set([""]));

    const [dates, setDates] = useState({} as TaskItemDateInfo)
    return (

        <Input
            id="task-input"
            label={<TaskCreateTargetLabel targetLabel={taskTargetLabel + " start: " + dates.start + " due: " + dates.due + " priority: " + selectedPriority} />}
            labelPlacement="outside"
            size="sm"
            classNames={{
                base: "p-0 h-fit",
                label: "w-full pl-1 font-mono text-sm",
                input: "p-0 w-full absolute",
                innerWrapper: "justify-end p-0 border-none",
                inputWrapper: "p-0 h-fit"
            }}
            placeholder="new tasks"
            endContent={
                <div className="gap-0 flex items-center bg-transparent border-0 outline-none relative">
                    <TrivialSingleSelect
                        key={"destination"}
                        icon={iconMap.fileIcon}
                        ariaLabel="List"
                        options={newItemDestinationOptions}
                        selectedKeys={selectedTarget}
                        setSelectedKeys={setSelectedTarget}
                    />
                    <TrivialSingleSelect
                        key={"priorities"}
                        ariaLabel="Priority"
                        icon={iconMap.priorityIcon}
                        options={priorityOptions}
                        selectedKeys={selectedPriority}
                        setSelectedKeys={setSelectedPriority}
                    />
                    <DatePickerListPopover
                        summitDates={setDates}
                    />
                </div>
            }
        />
    )
}

export default InputPanel;