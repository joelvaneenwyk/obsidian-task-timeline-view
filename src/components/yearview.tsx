import moment, { Moment } from 'moment';
import * as React from 'react';
import { TaskDataModel, TaskMapable } from '../utils/tasks';
import { DateView } from './dateview';

const defaultYearViewProps = {
    tasksOfThisYear: [] as TaskDataModel[],
    datesOfThisYear: [] as Moment[],
};
type YearViewProps = Readonly<typeof defaultYearViewProps>;
export class YearView extends React.Component<YearViewProps> {
    render(): React.ReactNode {
        if (this.props.datesOfThisYear.length === 0) return (<div></div>);
        return (
            <div>
                <YearHeader year={this.props.datesOfThisYear[0]} dataTypes={this.props.tasksOfThisYear.map(t => t.status)} />
                {this.props.datesOfThisYear.map((d, i) => {
                    const tasksOfThisDate = this.props.tasksOfThisYear.filter(TaskMapable.filterDate(d));
                    return (
                        <DateView date={d} tasksOfToday={tasksOfThisDate} key={i}/>
                    )
                })}
            </div>);
    }
}

const defaultYearHeaderProps = {
    year: moment() as Moment,
    dataTypes: [] as string[],
}
type YearHeaderProps = Readonly<typeof defaultYearHeaderProps>;
class YearHeader extends React.Component<YearHeaderProps> {
    render(): React.ReactNode {
        return (
            <div className={"year" + (this.props.year.isSame(moment(), 'year') ? " current" : "")}
                data-types={this.props.dataTypes.join(" ")}>
                {this.props.year.format("YYYY")}
            </div>
        );
    }
}