import React from "react";
import { MouseEventHandler } from "react";
import TaskItemInfoBadge from "./badge";


function IconTextBadge({
    icon,
    labelPrefix,
    label,
    labelSuffix,
    ariaLabelPrefix,
    ariaLabel,
    ariaLabelSuffix,
    onClick,
}: {
    icon: JSX.Element,
    labelPrefix?: string,
    label: string,
    labelSuffix?: string,
    ariaLabelPrefix?: string,
    ariaLabel?: string,
    ariaLabelSuffix?: string,
    onClick?: MouseEventHandler,
}) {
    labelPrefix = labelPrefix || "";
    labelSuffix = labelSuffix || "";
    ariaLabel = ariaLabel || "";
    ariaLabelPrefix = ariaLabelPrefix || "";
    ariaLabelSuffix = ariaLabelSuffix || "";

    return (
        <TaskItemInfoBadge
            icon={icon}
            label={labelPrefix + label + labelSuffix}
            ariaLabel={"" + ariaLabelPrefix + ariaLabel + labelSuffix}
            onClick={onClick}
        />
    )
}

export default IconTextBadge;