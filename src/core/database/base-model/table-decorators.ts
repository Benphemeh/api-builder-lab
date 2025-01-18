import { Model, Table, TableOptions } from 'sequelize-typescript';

export function ApiBuilderTable<M extends Model = Model>(
  options: TableOptions<M>,
): (target: any) => void {
  return (target: any) => {
    Table({
      ...options,
      underscored: true,
      timestamps: true,
      paranoid: true,
      deletedAt: 'deleted_at',
    })(target);
  };
}
