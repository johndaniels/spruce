import { useState, PropsWithChildren, useRef, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import Button from "@leafygreen-ui/button";
import { uiColors } from "@leafygreen-ui/palette";
import { Body, Label } from "@leafygreen-ui/typography";
import { Input } from "antd";
import Icon from "components/Icon";
import { toggleArray } from "utils/array";

const { Search } = Input;
const { gray, white, blue } = uiColors;

interface SearchableDropdownProps<T> {
  label: string | React.ReactNode;
  value: T | T[];
  onChange: (value: T | T[]) => void;
  searchFunc?: (options: T[], match: string) => T[];
  searchPlaceholder?: string;
  valuePlaceholder?: string;
  options: T[] | string[];
  optionRenderer?: (
    option: T,
    onClick: (selectedV) => void,
    isChecked: (selectedV) => boolean
  ) => React.ReactNode;
  allowMultiselect?: boolean;
  disabled?: boolean;
  ["data-cy"]?: string;
}
const SearchableDropdown = <T extends {}>({
  label,
  value,
  onChange,
  searchFunc,
  searchPlaceholder = "search...",
  valuePlaceholder = "Select an element",
  options,
  optionRenderer,
  allowMultiselect = false,
  disabled = false,
  "data-cy": dataCy = "searchable-dropdown",
}: PropsWithChildren<SearchableDropdownProps<T>>) => {
  const [isOpen, setisOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleOptions, setVisibleOptions] = useState(options);

  const listMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Handle onClickOutside
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onClickOutside = (event: MouseEvent) => {
      const stillFocused =
        menuButtonRef.current!.contains(event.target as Node) ||
        listMenuRef.current!.contains(event.target as Node);
      setisOpen(stillFocused);
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [listMenuRef, menuButtonRef, isOpen]);

  // Update options when they change
  useEffect(() => {
    if (options) {
      setVisibleOptions(options);
    }
  }, [options]);

  const onClick = (v: T) => {
    if (allowMultiselect) {
      if (Array.isArray(value)) {
        const newValue = toggleArray(v, value);
        onChange(newValue);
      } else {
        onChange([v]);
      }
    } else {
      onChange(v);
    }
    // Close the dropdown after user makes a selection only if it isn't a multiselect
    if (!allowMultiselect) {
      setisOpen(false);
    }
  };

  const option = optionRenderer
    ? (v: T) => optionRenderer(v, onClick, isChecked)
    : (v: T) => (
        <SearchableDropdownOption
          key={`searchable_dropdown_option_${v}`}
          value={v}
          onClick={() => onClick(v)}
          isChecked={isChecked(v)}
        />
      );

  const isChecked = (elementValue: T) => {
    if (typeof value === "string") {
      return value === elementValue;
    }
    if (Array.isArray(value)) {
      // v is included in value
      return value.filter((v) => v === elementValue).length > 0;
    }
  };

  const handleSearch = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: searchTerm } = e.target;
      setSearch(searchTerm);
      let filteredOptions = [];

      if (searchFunc) {
        // Alias the array as any to avoid TS error https://github.com/microsoft/TypeScript/issues/36390
        filteredOptions = searchFunc(options as T[], searchTerm);
      } else if (typeof options[0] === "string") {
        filteredOptions = (options as string[]).filter(
          (o) => o.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
        );
      } else {
        console.error(
          "A searchFunc must be supplied when options is not of type string[]"
        );
      }
      setVisibleOptions(filteredOptions);
    },
    [searchFunc, options]
  );

  let buttonText = valuePlaceholder;
  if (value) {
    if (typeof value === "string" && value.length !== 0) {
      buttonText = value;
    } else if (Array.isArray(value) && value.length !== 0) {
      buttonText = value.join(", ");
    } else {
      buttonText = value.toString();
    }
  }

  return (
    <>
      <Label htmlFor="searchable-dropdown">{label}</Label>
      <Wrapper>
        <StyledButton
          ref={menuButtonRef} // @ts-expect-error
          onClick={() => setisOpen((curr) => !curr)}
          data-cy={dataCy}
          id="searchable-dropdown"
          value={value}
          disabled={disabled}
        >
          <ButtonContent>
            <LabelWrapper>
              <Body data-cy="dropdown-value">{buttonText}</Body>
            </LabelWrapper>
            <FlexWrapper>
              <ArrowWrapper>
                <Icon glyph={isOpen ? "ChevronUp" : "ChevronDown"} />
              </ArrowWrapper>
            </FlexWrapper>
          </ButtonContent>
        </StyledButton>
        {isOpen && (
          <RelativeWrapper>
            <OptionsWrapper ref={listMenuRef} data-cy={`${dataCy}-options`}>
              <Search
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                data-cy={`${dataCy}-search-input`}
              />
              <ScrollableList>
                {(visibleOptions as T[])?.map((o) => option(o))}
              </ScrollableList>
            </OptionsWrapper>
          </RelativeWrapper>
        )}
      </Wrapper>
    </>
  );
};

interface SearchableDropdownOptionProps<T> {
  onClick: (v: T) => void;
  value: T;
  isChecked?: boolean;
  displayName?: string;
}
export const SearchableDropdownOption = <T extends {}>({
  onClick,
  isChecked,
  value,
  displayName,
}: PropsWithChildren<SearchableDropdownOptionProps<T>>) => (
  <Option
    onClick={() => onClick(value)}
    key={`select_${value}`}
    data-cy="searchable-dropdown-option"
  >
    <CheckmarkContainer>
      {isChecked && (
        <Icon glyph="Checkmark" height={12} width={12} fill={blue.base} />
      )}
    </CheckmarkContainer>
    {displayName || value}
  </Option>
);

const LabelWrapper = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OptionsWrapper = styled.div`
  border-radius: 5px;
  background-color: ${white};
  border: 1px solid ${gray.light1};
  padding: 8px;
  box-shadow: 0 3px 8px 0 rgba(231, 238, 236, 0.5);
  position: absolute;
  z-index: 5;
  margin-top: 5px;
  width: 100%;
`;

const ScrollableList = styled.div`
  overflow: scroll;
  max-height: 400px;
`;

// Used to provide a basis for the absolutely positions OptionsWrapper
const RelativeWrapper = styled.div`
  position: relative;
`;

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Wrapper = styled.div`
  width: ${(props: { width?: string }): string =>
    props.width ? props.width : ""};
`;

const FlexWrapper = styled.div`
  display: flex;
`;

const Option = styled.div`
  width: 100%;
  padding: 10px 12px;
  display: flex;
  flex-direction: row;
  :hover {
    cursor: pointer;
    background-color: ${gray.light1};
  }
`;

const CheckmarkContainer = styled.div`
  width: 24px;
`;

/* @ts-expect-error */
const StyledButton = styled(Button)`
  width: 100%;
` as typeof Button;

const ButtonContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
export default SearchableDropdown;