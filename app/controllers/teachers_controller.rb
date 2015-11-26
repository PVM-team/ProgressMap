class TeachersController < ApplicationController

  def index
    @teachers = Teacher.all
  end

  def show
      @teachers = Teacher.all

    render 'teachers/show.json.jbuilder'
  end

  def new
    @teacher = Teacher.new
  end

  def edit
  end

  def destroy
  end

end
