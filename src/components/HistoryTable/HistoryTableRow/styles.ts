import styled from "@emotion/styled";
import { uiColors } from "@leafygreen-ui/palette";

const { blue } = uiColors;
export const LabelCellContainer = styled.div`
  min-width: 200px;
  padding-right: 40px;
`;

export const RowContainer = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ selected }) => selected && `background-color: ${blue.light3};`};
`;
