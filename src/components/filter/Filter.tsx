import React from "react";
import { CheckboxGroup, Popover, PopoverContent, PopoverTrigger, Avatar } from "@nextui-org/react";
import { ChipStyleCheckbox } from "./ChipStyleCheckbox";
import { iconMap } from "../asserts/icons";

function Filter() {
    const [groupSelected, setGroupSelected] = React.useState([""]);

    return (
        <Popover
            placement="bottom"
        >
            <PopoverTrigger>
                <Avatar
                    alt="Dates"
                    icon={iconMap.dueIcon}
                    size="sm"
                    radius="sm"
                    isBordered={false}
                    classNames={{
                        base: "bg-transparent px-0"
                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-1 w-full">
                <CheckboxGroup
                    className="gap-1"
                    label="Select amenities"
                    orientation="horizontal"
                    value={groupSelected}
                    onValueChange={setGroupSelected}
                >
                    <ChipStyleCheckbox value="wifi"># Wifi</ChipStyleCheckbox>
                    <ChipStyleCheckbox value="tv"># TV</ChipStyleCheckbox>
                    <ChipStyleCheckbox value="kitchen"># Kitchen</ChipStyleCheckbox>
                    <ChipStyleCheckbox value="parking"># Parking</ChipStyleCheckbox>
                    <ChipStyleCheckbox value="pool"># Pool</ChipStyleCheckbox>
                    <ChipStyleCheckbox value="gym"># Gym</ChipStyleCheckbox>
                </CheckboxGroup>
                <p className="mt-4 ml-1 text-default-500">
                    Selected: {groupSelected.join(", ")}
                </p>
            </PopoverContent>
        </Popover>

    );
}

export default Filter;