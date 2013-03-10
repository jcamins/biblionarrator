<?php

class Create_Links_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('field_links', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('field_id')->unsigned();
            $table->foreign('field_id')->references('id')->on('fields');
            $table->integer('recordtype_id')->unsigned();
            $table->foreign('recordtype_id')->references('id')->on('recordtypes');
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
        Schema::drop('field_links');
	}

}
