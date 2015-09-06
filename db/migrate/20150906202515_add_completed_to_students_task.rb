class AddCompletedToStudentsTask < ActiveRecord::Migration
  def change
    add_column :students_tasks, :complete, :boolean
  end
end
