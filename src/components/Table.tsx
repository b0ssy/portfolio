import React, { useRef, useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

import Button, { ButtonProps } from "./Button";
import Checkbox from "./Checkbox";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { sleep } from "../lib/utils";

// Operation
export type Op = ({ type: "init" } | { type: "refresh" } | { type: "done" }) & {
  loading?: boolean;
  immediate?: boolean;
};

// Options for counting data
export interface TableCountOptions {}

// Options for reading data
export interface TableReadOptions<T> {
  from: number;
  to: number;
  sort?: {
    column: keyof T;
    orderBy: "asc" | "desc";
  };
}

// Options for deleting data
export interface TableDeleteOptions<T> {
  items: T[];
}

export interface TableProps<T> {
  columns: {
    field?: keyof T;
    title: string;
    disableSort?: boolean;
    onRender: (item: T) => string | React.ReactNode;
  }[];
  itemsPerPage?: number;
  actions?: React.ReactNode;
  itemActions?: {
    title: string;
    buttonProps?: ButtonProps;
    singleItemOnly?: boolean;
    onClick: (items: T[]) => void;
  }[];
  sortable?: boolean;
  refresh?: number;
  onCount: (options: TableCountOptions) => Promise<{
    count: number;
    data?: T[];
  }>;
  onRead?: (options: TableReadOptions<T>) => Promise<T[]>;
  onDelete?: (options: TableDeleteOptions<T>) => Promise<void>;
  onItemSelectable?: (item: T) => boolean;
}

export default function Table<T>(props: TableProps<T>) {
  const [op, setOp] = useState<Op>({ type: "init" });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [fullItems, setFullItems] = useState<T[] | null>(null);
  const [selectedItemsMap, setSelectedItemsMap] = useState<{
    [k: number]: boolean;
  }>({});
  const [sort, setSort] = useState<{
    column: keyof T;
    orderBy: "asc" | "desc";
  } | null>(null);
  const [openDeletePrompt, setOpenDeletePrompt] = useState(false);
  const opId = useRef(Date.now());

  const itemsPerPage = Math.max(props.itemsPerPage ?? 10, 1);
  const totalPages = Math.max(Math.ceil(count / itemsPerPage), 1);
  const numSelectableItems = props.onItemSelectable
    ? items.filter((item) => props.onItemSelectable!(item)).length
    : items.length;

  // Run operation
  useEffect(() => {
    if (op.loading || op.type === "done") {
      return;
    }

    const id = Date.now();
    opId.current = id;
    setOp({ ...op, loading: true });

    const startMs = Date.now();

    const init = async () => {
      let { count, data } = await props.onCount({});
      const isFullItems = !!data?.length;
      if (!data && count > 0) {
        const from = 0;
        const to = itemsPerPage;
        data = props.onRead
          ? await props.onRead({
              from,
              to,
              sort: sort ?? undefined,
            })
          : undefined;
      }
      if (opId.current !== id) {
        return;
      }
      const diff = 500 - (Date.now() - startMs);
      if (!op.immediate && diff > 0) {
        await sleep(diff);
      }
      setPage(1);
      setCount(count);
      if (isFullItems) {
        setFullItems(data ?? []);
      } else {
        setItems(data ?? []);
      }
      setOp({ type: "done" });
    };

    const refresh = async () => {
      const from = (page - 1) * itemsPerPage;
      const to = (page - 1) * itemsPerPage + itemsPerPage;
      const data = props.onRead
        ? await props.onRead({
            from,
            to,
            sort: sort ?? undefined,
          })
        : undefined;
      if (opId.current !== id) {
        return;
      }
      const diff = 500 - (Date.now() - startMs);
      if (!op.immediate && diff > 0) {
        await sleep(diff);
      }
      setItems(data ?? []);
      setOp({ type: "done" });
    };

    if (op.type === "init") {
      init();
    } else if (op.type === "refresh") {
      refresh();
    } else {
      setOp({ type: "done" });
    }
  }, [op, page, itemsPerPage, sort, props.onCount, props.onRead]);

  // Refresh page
  useEffect(() => {
    if (props.refresh === undefined) {
      return;
    }
    setOp({ type: "init", immediate: true });
  }, [props.refresh]);

  // Set items from full items
  useEffect(() => {
    if (!fullItems) {
      return;
    }
    const from = (page - 1) * itemsPerPage;
    const to = (page - 1) * itemsPerPage + itemsPerPage - 1;
    const items = fullItems.slice(from, to);
    setItems(items);
  }, [fullItems, page]);

  // Navigate to first page
  function firstPage() {
    if (page <= 1) {
      return;
    }
    setPage(1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to previous page
  function prevPage() {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to next page
  function nextPage() {
    if (page >= totalPages) {
      return;
    }
    setPage(page + 1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to last page
  function lastPage() {
    if (page >= totalPages) {
      return;
    }
    setPage(totalPages);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Refresh current page
  function refreshPage(options?: { page?: number; immediate?: boolean }) {
    // Clear selection because right now it indexes by item index
    setSelectedItemsMap({});
    setPage(page);
    setOp({ type: "init", immediate: options?.immediate });
  }

  // Delete items
  async function deleteItems(items: T[]) {
    if (!props.onDelete) {
      return;
    }
    await props.onDelete({ items });
    setSelectedItemsMap({});
    refreshPage({ immediate: true });
  }

  const selectedItems = items.filter((_, index) => selectedItemsMap[index]);
  const itemActions = [...(props.itemActions ?? [])];

  // Add item action to delete items
  if (props.onDelete) {
    itemActions.push({
      title: "Delete",
      buttonProps: {
        color: "error",
      },
      onClick: () => {
        setOpenDeletePrompt(true);
      },
    });
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex flex-row py-3 gap-2 items-center text-dim">
        {/* Actions */}
        {Object.keys(selectedItemsMap).length === 0 && props.actions}

        {/* Item actions */}
        {itemActions.length > 0 && Object.keys(selectedItemsMap).length > 0 && (
          <>
            <span className="pr-2">
              Selected {Object.keys(selectedItemsMap).length} item
              {Object.keys(selectedItemsMap).length > 1 ? "s" : ""}
            </span>
            {itemActions
              .filter(
                (action) =>
                  !action.singleItemOnly ||
                  Object.keys(selectedItemsMap).length === 1
              )
              .map((action) => {
                return (
                  <Button
                    key={action.title}
                    size="sm"
                    onClick={() => {
                      if (action.onClick) {
                        action.onClick(selectedItems);
                      }
                    }}
                    {...action.buttonProps}
                  >
                    {action.title}
                  </Button>
                );
              })}
          </>
        )}

        <div className="flex-grow" />

        {/* Refresh */}
        <Button
          variant="outlined"
          size="sm"
          onClick={() => {
            refreshPage();
          }}
        >
          Refresh
        </Button>

        {/* Pagination */}
        <div className="flex flex-row gap-2 ml-2">
          <Button
            variant="outlined"
            size="sm"
            className="px-2"
            onClick={firstPage}
          >
            <ChevronDoubleLeftIcon className="icon w-4 h-4" />
          </Button>
          <Button
            variant="outlined"
            size="sm"
            className="px-2"
            onClick={prevPage}
          >
            <ChevronLeftIcon className="icon w-4 h-4" />
          </Button>
          <div className="px-3 py-1 text">
            {page} of {totalPages}
          </div>
          <Button
            variant="outlined"
            size="sm"
            className="px-2"
            onClick={nextPage}
          >
            <ChevronRightIcon className="icon w-4 h-4" />
          </Button>
          <Button
            variant="outlined"
            size="sm"
            className="px-2"
            onClick={lastPage}
          >
            <ChevronDoubleRightIcon className="icon w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="paper px-6 pt-4 pb-3">
        {/* Columns */}
        <div className="flex flex-row gap-2 items-center">
          {/* Selection checkbox */}
          {itemActions.length > 0 && numSelectableItems > 0 && (
            <span className="w-12 flex flex-row justify-center">
              <Checkbox
                state={
                  Object.keys(selectedItemsMap).length === numSelectableItems &&
                  numSelectableItems > 0
                    ? "checked"
                    : Object.keys(selectedItemsMap).length > 0
                    ? "partial"
                    : undefined
                }
                onClick={() => {
                  if (
                    Object.keys(selectedItemsMap).length === numSelectableItems
                  ) {
                    setSelectedItemsMap({});
                  } else {
                    const selectedItems: { [k: number]: boolean } = {};
                    for (let i = 0; i < items.length; i++) {
                      if (
                        !props.onItemSelectable ||
                        props.onItemSelectable(items[i])
                      ) {
                        selectedItems[i] = true;
                      }
                    }
                    setSelectedItemsMap(selectedItems);
                  }
                }}
              />
            </span>
          )}

          {/* Data columns */}
          {props.columns.map((column) => {
            const sortable =
              props.sortable &&
              !column.disableSort &&
              column.field !== undefined;
            return (
              <span
                key={column.title}
                className={`flex flex-row items-center gap-2 flex-1 text hover:select-none ${
                  sortable ? "cursor-pointer group" : ""
                }`}
                onClick={
                  sortable
                    ? () => {
                        if (column.field === undefined) {
                          return;
                        }
                        if (sort?.column !== column.field) {
                          setSort({
                            column: column.field,
                            orderBy: "desc",
                          });
                          refreshPage({ page: 0 });
                        } else {
                          setSort(
                            sort.orderBy === "desc"
                              ? {
                                  column: column.field,
                                  orderBy: "asc",
                                }
                              : null
                          );
                          refreshPage({ page: 0 });
                        }
                      }
                    : undefined
                }
              >
                {column.title}
                {column.field !== undefined &&
                  sort?.column === column.field &&
                  sort?.orderBy === "asc" && (
                    <ChevronUpIcon className="w-4 h-4 text dark:stroke-white" />
                  )}
                {column.field !== undefined &&
                  sort?.column === column.field &&
                  sort?.orderBy === "desc" && (
                    <ChevronDownIcon className="w-4 h-4 text dark:stroke-white" />
                  )}
                {column.field !== undefined &&
                  sort?.column !== column.field && (
                    <ChevronUpDownIcon className="w-4 h-4 text-disabled hidden group-hover:block" />
                  )}
              </span>
            );
          })}
        </div>
        <div className="divider mt-4 mb-2" />

        {/* No data available */}
        {op.type === "done" && count <= 0 && (
          <div className="flex justify-center py-4">
            <span className="text text-dim">No data available</span>
          </div>
        )}

        {/* Items */}
        {items.map((item, index) => {
          return (
            <div key={index}>
              <div className="flex flex-row gap-2 items-center py-1">
                {/* Selection checkbox */}
                {itemActions.length > 0 && numSelectableItems > 0 && (
                  <span
                    className={`w-12 flex flex-row justify-center ${
                      props.onItemSelectable && !props.onItemSelectable(item)
                        ? "invisible"
                        : ""
                    }`}
                  >
                    <Checkbox
                      state={selectedItemsMap[index] ? "checked" : undefined}
                      onClick={() => {
                        if (selectedItemsMap[index]) {
                          delete selectedItemsMap[index];
                          setSelectedItemsMap({ ...selectedItemsMap });
                        } else {
                          setSelectedItemsMap({
                            ...selectedItemsMap,
                            [index]: true,
                          });
                        }
                      }}
                    />
                  </span>
                )}

                {props.columns.map((column) => {
                  return (
                    <div
                      key={column.title}
                      className="flex-1 text text-dim text-sm"
                    >
                      {column.onRender(item)}
                    </div>
                  );
                })}
              </div>
              {index !== items.length - 1 ? (
                <div className="divider my-2" />
              ) : null}
            </div>
          );
        })}

        {/* Spinner */}
        {!!op.loading && (
          <div className="flex w-full py-3 justify-center">
            <Spinner />
          </div>
        )}
      </div>

      {/* Delete prompt */}
      {!!props.onDelete && (
        <Modal
          open={openDeletePrompt}
          title={`Confirm Delete ${selectedItems.length} Item${
            selectedItems.length > 1 ? "s" : ""
          }?`}
          onClose={() => {
            setOpenDeletePrompt(false);
          }}
        >
          <div className="flex flex-row justify-end w-72">
            <Button
              color="error"
              size="sm"
              onClick={() => {
                deleteItems(selectedItems);
                setOpenDeletePrompt(false);
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
