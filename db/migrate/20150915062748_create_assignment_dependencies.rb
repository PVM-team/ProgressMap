class CreateAssignmentDependencies < ActiveRecord::Migration
  def change
    create_table :assignment_dependencies do |t|
      t.integer :assignment_id
      t.integer :dependency_id

      t.timestamps null: false
    end
  end
end