class AddTokenToCourses < ActiveRecord::Migration
  def change
  	add_column :courses, :token, :string
  end
end