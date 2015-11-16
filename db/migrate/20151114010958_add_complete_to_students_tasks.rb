class AddCompleteToStudentsTasks < ActiveRecord::Migration
  def change
    add_column :students_tasks, :complete, :boolean, default: false
  end
end
