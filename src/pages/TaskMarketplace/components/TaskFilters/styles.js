import styled from '@emotion/styled';

export const FiltersContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 1.5rem;
  background: #111111;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  margin-bottom: 2rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;

  span {
    color: #a0a0a0;
    font-size: 0.875rem;
  }
`;

export const FilterLabel = styled.label`
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const Select = styled.select`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #ffffff;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:focus {
    border-color: #00ff94;
    outline: none;
  }
`;

export const RangeInput = styled.input`
  width: 100%;
  -webkit-appearance: none;
  background: #1a1a1a;
  border-radius: 4px;
  height: 4px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #00ff94;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #00ff94;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;
