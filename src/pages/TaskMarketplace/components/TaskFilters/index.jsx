import React from 'react';
import { FiltersContainer, FilterGroup, FilterLabel, Select, RangeInput } from './styles';

const TaskFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <FiltersContainer>
      <FilterGroup>
        <FilterLabel>Difficulty</FilterLabel>
        <Select
          value={filters.difficulty}
          onChange={(e) => handleChange('difficulty', e.target.value)}
        >
          <option value="all">All</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Min Reward</FilterLabel>
        <RangeInput
          type="range"
          min="0"
          max="1000"
          value={filters.minReward}
          onChange={(e) => handleChange('minReward', e.target.value)}
        />
        <span>{filters.minReward} NEURO</span>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Success Rate</FilterLabel>
        <RangeInput
          type="range"
          min="0"
          max="100"
          value={filters.minSuccessRate}
          onChange={(e) => handleChange('minSuccessRate', e.target.value)}
        />
        <span>{filters.minSuccessRate}%</span>
      </FilterGroup>
    </FiltersContainer>
  );
};

export default TaskFilters;
