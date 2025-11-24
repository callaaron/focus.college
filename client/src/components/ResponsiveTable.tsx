import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  mobileLabel?: string; // Label to show in mobile view
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "暂无数据"
}: ResponsiveTableProps<T>) {
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left p-3 text-sm font-medium text-muted-foreground ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={`border-b hover:bg-muted/50 transition-colors ${
                  index % 2 === 0 ? '' : 'bg-muted/20'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-3 text-sm ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <Card key={keyExtractor(item)} className="p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
                    {column.mobileLabel || column.header}
                  </span>
                  <div className="text-sm text-right flex-1">
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]
                    }
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
