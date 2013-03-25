<?php

class Link_Records_To_Recordtypes {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('records', function($table) {
            $table->integer('recordtype')->unsigned()->nullable();
            $table->foreign('recordtype')->references('id')->on('recordtypes');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('records', function($table) {
            $table->drop_column('recordtype');
        });
	}

}
