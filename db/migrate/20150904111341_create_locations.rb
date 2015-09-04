class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.integer :x
      t.integer :y
      t.integer :assignment_id

      t.timestamps null: false
    end
  end
end
