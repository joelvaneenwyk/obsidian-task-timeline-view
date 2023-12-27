import React from "react";
import { MouseEventHandler } from "react";
import moment from "moment";
import IconTextBadge from "./icon_text_badge";
import { innerDateFormat } from "../../../../utils/tasks";


function IconDateBadge({
    icon,
    labelPrefix,
    labelSuffix,
    ariaLabelPrefix,
    ariaLabelSuffix,
    date,
    onClick,
}: {
    icon: JSX.Element,
    labelPrefix?: string,
    labelSuffix?: string,
    ariaLabelPrefix?: string,
    ariaLabelSuffix?: string,
    date: moment.Moment,
    onClick?: MouseEventHandler,
}) {

    labelPrefix = labelPrefix || "";
    labelSuffix = labelSuffix || "";
    ariaLabelPrefix = ariaLabelPrefix || "";
    ariaLabelSuffix = ariaLabelPrefix || "";

    const label = date.format(innerDateFormat);

    return (
        <IconTextBadge
            icon={icon}
            labelPrefix={labelPrefix}
            labelSuffix={labelSuffix}
            ariaLabelPrefix={ariaLabelPrefix}
            ariaLabelSuffix={ariaLabelSuffix}
            label={label}
            ariaLabel={label}
        />
    )
}

export default IconDateBadge;