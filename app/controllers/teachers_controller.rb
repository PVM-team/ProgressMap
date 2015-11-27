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

    def create
        @teacher = Teacher.new(:email => params["email"], :name => params["name"])
        @teacher.save
        render json: @teacher
    end

    def edit
    end

    def destroy
    end

end
