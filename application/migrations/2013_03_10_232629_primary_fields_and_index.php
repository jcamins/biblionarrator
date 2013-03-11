<?php

class Primary_Fields_And_Index {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('fields', function($table) {
            $table->boolean('primary');
        });
        Schema::table('primaries', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('key');
            $table->integer('record_id')->unsigned();
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
        Schema::table('fields', function($table) {
            $table->drop_column('primary');
            Schema::drop('primaries');
        });
	}

}
