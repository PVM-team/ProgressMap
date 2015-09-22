class AddNumberToAssignments < ActiveRecord::Migration
  def change
  	add_column :assignments, :number, :integer
  end
end