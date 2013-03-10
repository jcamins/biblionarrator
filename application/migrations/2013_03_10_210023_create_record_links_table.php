<?php

class Create_Record_Links_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('record_links', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('source_id')->unsigned();
            $table->foreign('source_id')->references('id')->on('records');
            $table->integer('target_id')->unsigned();
            $table->foreign('target_id')->references('id')->on('records');
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
        Schema::drop('record_links');
	}

}
