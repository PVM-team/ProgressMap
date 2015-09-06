class CreateStudentsTasks < ActiveRecord::Migration
  def change
    create_table :students_tasks do |t|
      t.integer :assignment_id
      t.integer :user_id

      t.timestamps null: false
    end
  end
end