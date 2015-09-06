class RemoveLocationIdFromAssignments < ActiveRecord::Migration
  def change
  	remove_column :assignments, :location_id
  end
end