class RenameUserIdToStudentsIdInStudentsTasks < ActiveRecord::Migration
  def change
  	rename_column :students_tasks, :user_id, :student_id
  end
end