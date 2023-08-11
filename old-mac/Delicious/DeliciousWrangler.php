<?php

/**
 * DeliciousWrangler extracts the entries from the text export from
 * the delicious library export by column name in the BuildSummary
 * function. The makeTable function outputs a table ready to be 
 * formatted with the 'SortedTable' Javascripts.
 * 
 * @author Abbey Hawk Sparrow
 * @version 1.0
 * @modificationDate 08-11-2006
 * @creationDate 01-26-2006
 */

class DeliciousWrangler{
    var $fileLines;
    var $columnOrder;
    var $lookup;
    
    function DeliciousWrangler($fileName, $columnList){
        $this->fileLines = file($fileName);
        $this->columnOrder = explode(",", $columnList);
    }
    
    function BuildSummary($criteria, $value){
        $result = array();
        $first = true;
        foreach ($this->fileLines as $line_num => $line) {
            if($first){
                $columnKey = explode("	", $line);
                $first = false;
                //create reverse lookup for direct lookup
                foreach ( $columnKey as $entryNum => $thisEntry) {
                    $this->lookup[trim($thisEntry)] = $entryNum;
                }
            }else{ 
                $row = array();
                $thisRow = explode("	", $line);
                if($thisRow[$this->lookup[$criteria]] == trim($value)){
                    //echo($value." found!<br />");
                    foreach ( $this->columnOrder as $num => $name) {
                        $row[trim($name)] = $thisRow[$this->lookup[trim($name)]];
                    }
                    array_push($result, $row);
                }
            }
        }
        return $result;
    }
    
    function makeTable($summary){
        $first = true;
        $result = "<table class=\"sorted\" cellspacing=\"0\" cellpadding=\"0\">\n";
        foreach ( $summary as $num => $row){
            if($first) $head = "";
            $rowHTML = "";
            foreach ( $row as $name => $value){
                if($first) $head .= "<th id=\"".$name."\"><span class=\"n\">".$name."</span></th>";
                $rowHTML .= "<td axis=\"string\" headers=\"".$name."\">".$value."</td>\n";
            }
            if($first) $result .= "<thead><tr>".$head."</tr>\n</thead>\n<tbody>\n";
            $result .= "<tr>\n".$rowHTML."</tr>\n";
            $first = false;
        }
        $result .= "</tbody>\n</table>";
        return $result;
    }
}
?>