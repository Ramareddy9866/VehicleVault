// Dropdown select field.
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  size = 'small',
  sx = {},
  renderOption,
  ...selectProps
}) => (
  <FormControl fullWidth size={size} required={required} sx={sx}>
    <InputLabel>{label}</InputLabel>
    <Select
      label={label}
      value={value}
      onChange={onChange}
      {...selectProps}
    >
      {options.map((option, idx) =>
        renderOption ? (
          renderOption(option, idx)
        ) : (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        )
      )}
    </Select>
  </FormControl>
);

export default SelectField; 