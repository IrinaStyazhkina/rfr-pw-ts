import {useState} from "react";
import {TablePagination} from ".";
import {AppScaffold} from "../../../stories/AppScaffold";
import {Probe} from "../../../stories/Probe";

interface PaginationStoryInterface {
    hasNext?: boolean;
    hasPrevious?: boolean;
}

export const Default = ({hasNext = true, hasPrevious = true}: PaginationStoryInterface) => {
    const [moves, setMoves] = useState<string[]>([]);
    return (
        <AppScaffold>
            <TablePagination
                hasNextValues={hasNext}
                hasPreviousValues={hasPrevious}
                onPreviousClick={() => setMoves((list) => [...list, "previous"])}
                onNextClick={() => setMoves((list) => [...list, "next"])}
            />
            <Probe values={{moves}}/>
        </AppScaffold>
    );
};
