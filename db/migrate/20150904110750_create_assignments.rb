class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.integer :course_id
      t.integer :location_id

      t.timestamps null: false
    end
  end
end