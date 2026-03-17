import { ProductOption } from "../../types/models";
import { TypeFilter } from "./TypeFilter";

type CollectionFilterProps = {
  options: ProductOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

export function CollectionFilter({
  options,
  selectedValues,
  onToggle,
}: CollectionFilterProps) {
  return (
    <TypeFilter
      emptyText="Коллекции пока не подключены."
      onToggle={onToggle}
      options={options}
      selectedValues={selectedValues}
      title="Коллекция"
    />
  );
}
