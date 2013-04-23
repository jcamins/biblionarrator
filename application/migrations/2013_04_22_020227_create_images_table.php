<?php

class Create_Images_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('images', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('description');
            $table->string('location');
            $table->integer('record_id')->unsigned()->nullable();
            $table->foreign('record_id')->references('id')->on('records');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('images');
	}

}
