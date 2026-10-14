import {Table} from "@mui/material";
import {TableHead} from ".";
import {HeadCell} from "../HeadCell";
import {AppScaffold} from "../../../stories/AppScaffold";

interface TableHeadStoryInterface {
    headCells?: HeadCell[];
}

export const Default = ({headCells = [{id: "name", label: "Name", numeric: false}]}: TableHeadStoryInterface) => (
    <AppScaffold>
        <Table>
            <TableHead headCells={headCells}/>
        </Table>
    </AppScaffold>
);
